import { Handover } from '../models/Handover.js';
import { RepairOrder } from '../models/RepairOrder.js';
import { generateRecordId } from '../utils/generateRecordId.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const createHandover = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const {
      id: clientId,
      orderId,
      repairOrderId,
      itemName,
      customerName,
      customerPhone,
      itemPhoto,
      verificationMethod,
      verificationChecklist,
      staffMember,
      notes
    } = req.body;

    const targetOrderId = repairOrderId || orderId;

    // 1. Find repair order
    const repairOrder = await RepairOrder.findOne({
      shopId,
      recordId: targetOrderId
    });

    if (!repairOrder) {
      return sendError(
        res,
        'REPAIR_NOT_FOUND',
        `Repair order ${targetOrderId} does not exist in this shop`,
        [],
        404
      );
    }

    // 2. Prevent duplicate handovers for this repair order
    const existingHandover = await Handover.findOne({
      shopId,
      repairOrderId: targetOrderId
    });

    if (existingHandover) {
      return sendError(
        res,
        'HANDOVER_ALREADY_EXISTS',
        `A handover has already been completed for repair order ${targetOrderId} (${existingHandover.recordId})`,
        [],
        409
      );
    }

    // 3. Generate handover record ID
    let recordId = clientId;
    if (recordId) {
      const exists = await Handover.findOne({ shopId, recordId });
      if (exists) {
        recordId = await generateRecordId(Handover, 'HND', shopId);
      }
    } else {
      recordId = await generateRecordId(Handover, 'HND', shopId);
    }

    const handoverDate = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // 4. Create Handover and update RepairOrder atomically
    const newHandover = await Handover.create({
      recordId,
      shopId,
      repairOrderId: targetOrderId,
      itemName: itemName || repairOrder.name,
      customerName: customerName || repairOrder.customerName,
      customerPhone: customerPhone || repairOrder.customerPhone || '',
      itemPhoto: itemPhoto || repairOrder.photos?.[0] || '',
      verificationMethod: verificationMethod || 'Visual Characteristics & Photo Match',
      verificationChecklist: verificationChecklist || {},
      staffMember: staffMember || req.user.name,
      handoverDate,
      handoverStatus: 'Completed',
      notes: notes || 'Item verified against digital record and handed over to customer.',
      createdBy: req.user.id
    });

    // 5. Update linked RepairOrder
    repairOrder.repairStatus = 'Completed';
    repairOrder.verificationComplete = true;
    repairOrder.handoverId = recordId;
    repairOrder.updatedBy = req.user.id;
    repairOrder.notes = repairOrder.notes
      ? `${repairOrder.notes}\n[${handoverDate}] Handover completed (${recordId}) by ${req.user.name}`
      : `[${handoverDate}] Handover completed (${recordId}) by ${req.user.name}`;
    await repairOrder.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'HANDOVER_COMPLETE',
      targetType: 'Handover',
      targetId: recordId,
      summary: `Completed item handover ${recordId} for order ${targetOrderId}`
    });

    return sendSuccess(
      res,
      {
        handover: newHandover,
        repairOrder
      },
      'Item handover completed successfully',
      201
    );
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const listHandovers = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { q, page = 1, limit = 100, sort = '-createdAt' } = req.query;

    const query = { shopId };

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [
        { recordId: regex },
        { repairOrderId: regex },
        { itemName: regex },
        { customerName: regex },
        { customerPhone: regex },
        { staffMember: regex },
        { verificationMethod: regex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      Handover.countDocuments(query),
      Handover.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    const formatted = items.map((item) => ({
      ...item,
      id: item.recordId,
      orderId: item.repairOrderId
    }));

    return sendSuccess(res, {
      items: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const getHandoverById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const handover = await Handover.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    }).lean();

    if (!handover) {
      return sendError(res, 'NOT_FOUND', 'Handover record not found', [], 404);
    }

    return sendSuccess(res, {
      ...handover,
      id: handover.recordId,
      orderId: handover.repairOrderId
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const getRepairHandover = async (req, res) => {
  try {
    const { id } = req.params; // repair order ID
    const shopId = req.user.shopId;

    const handover = await Handover.findOne({
      shopId,
      repairOrderId: id
    }).lean();

    if (!handover) {
      return sendError(res, 'NOT_FOUND', 'No handover record found for this repair order', [], 404);
    }

    return sendSuccess(res, {
      ...handover,
      id: handover.recordId,
      orderId: handover.repairOrderId
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
