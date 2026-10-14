import { RepairOrder } from '../models/RepairOrder.js';
import { Handover } from '../models/Handover.js';
import { generateRecordId } from '../utils/generateRecordId.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const createRepair = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const body = req.body;

    // Check if client supplied an ID or generate one
    let recordId = body.id;
    if (recordId) {
      const exists = await RepairOrder.findOne({ shopId, recordId });
      if (exists) {
        // If client draft ID collided, generate a fresh unique one
        recordId = await generateRecordId(RepairOrder, 'RO', shopId);
      }
    } else {
      recordId = await generateRecordId(RepairOrder, 'RO', shopId);
    }

    const newOrder = await RepairOrder.create({
      ...body,
      recordId,
      shopId,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await logAudit({
      shopId,
      actor: req.user,
      action: 'REPAIR_ORDER_CREATE',
      targetType: 'RepairOrder',
      targetId: recordId,
      summary: `Created repair order ${recordId} for ${body.name}`
    });

    return sendSuccess(res, newOrder, 'Repair order created successfully', 201);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const listRepairs = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const {
      q,
      category,
      brand,
      status,
      from,
      to,
      page = 1,
      limit = 100,
      sort = '-createdAt'
    } = req.query;

    const query = { shopId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (brand && brand !== 'All') {
      query.brand = brand;
    }

    if (status && status !== 'All') {
      query.repairStatus = status;
    }

    if (from || to) {
      query.dateReceived = {};
      if (from) query.dateReceived.$gte = from;
      if (to) query.dateReceived.$lte = to;
    }

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [
        { recordId: regex },
        { customerName: regex },
        { customerPhone: regex },
        { name: regex },
        { brand: regex },
        { model: regex },
        { serialNumber: regex },
        { distinctiveMarks: regex },
        { reportedProblem: regex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      RepairOrder.countDocuments(query),
      RepairOrder.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    const formatted = items.map((item) => ({
      ...item,
      id: item.recordId
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

export const getRepairById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    // Search by recordId or ObjectId
    let order = await RepairOrder.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    }).lean();

    if (!order) {
      return sendError(res, 'NOT_FOUND', 'Repair order not found', [], 404);
    }

    return sendSuccess(res, {
      ...order,
      id: order.recordId
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const updateRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const order = await RepairOrder.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!order) {
      return sendError(res, 'NOT_FOUND', 'Repair order not found', [], 404);
    }

    // Update editable fields
    const updates = req.body;
    delete updates.recordId;
    delete updates.shopId;
    delete updates.repairStatus; // status updates must use status endpoint

    Object.assign(order, updates);
    order.updatedBy = req.user.id;
    await order.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'REPAIR_ORDER_UPDATE',
      targetType: 'RepairOrder',
      targetId: order.recordId,
      summary: `Updated repair order ${order.recordId}`
    });

    return sendSuccess(res, order, 'Repair order updated successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const updateRepairStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const shopId = req.user.shopId;

    const order = await RepairOrder.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!order) {
      return sendError(res, 'NOT_FOUND', 'Repair order not found', [], 404);
    }

    // Business rule: Do not allow direct transition to Completed without verified handover
    if (status === 'Completed') {
      const existingHandover = await Handover.findOne({ shopId, repairOrderId: order.recordId });
      if (!existingHandover) {
        return sendError(
          res,
          'HANDOVER_REQUIRED',
          'Repair order cannot be set to Completed directly. Complete the Handover Verification workflow first.',
          [],
          422
        );
      }
    }

    const previousStatus = order.repairStatus;
    order.repairStatus = status;

    if (note) {
      const timestamp = new Date().toLocaleDateString('en-IN');
      const noteEntry = `[${timestamp} by ${req.user.name}] Status changed to ${status}: ${note}`;
      order.notes = order.notes ? `${order.notes}\n${noteEntry}` : noteEntry;
    }

    order.verificationHistory.push({
      date: new Date().toISOString(),
      previousStatus,
      newStatus: status,
      staff: req.user.name,
      note: note || ''
    });

    order.updatedBy = req.user.id;
    await order.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'REPAIR_STATUS_CHANGE',
      targetType: 'RepairOrder',
      targetId: order.recordId,
      summary: `Status of ${order.recordId} changed from ${previousStatus} to ${status}`
    });

    return sendSuccess(res, order, `Repair status updated to ${status}`);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const order = await RepairOrder.findOneAndDelete({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!order) {
      return sendError(res, 'NOT_FOUND', 'Repair order not found', [], 404);
    }

    await logAudit({
      shopId,
      actor: req.user,
      action: 'REPAIR_ORDER_DELETE',
      targetType: 'RepairOrder',
      targetId: order.recordId,
      summary: `Deleted repair order ${order.recordId} (${order.name})`
    });

    return sendSuccess(res, {}, 'Repair order deleted successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
