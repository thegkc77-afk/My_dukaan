import { SalesRecord } from '../models/SalesRecord.js';
import { generateRecordId } from '../utils/generateRecordId.js';
import { calculateWarrantyExpiry, getWarrantyStatus } from '../utils/dateUtils.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const createSale = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const body = req.body;

    // Check or generate record ID
    let recordId = body.id;
    if (recordId) {
      const exists = await SalesRecord.findOne({ shopId, recordId });
      if (exists) {
        recordId = await generateRecordId(SalesRecord, 'SL', shopId);
      }
    } else {
      recordId = await generateRecordId(SalesRecord, 'SL', shopId);
    }

    // Authoritative server-side warranty expiry calculation
    const warrantyExpiryDate = calculateWarrantyExpiry(body.purchaseDate, body.warrantyDuration);
    const { status: warrantyStatus } = getWarrantyStatus(warrantyExpiryDate);

    const newSale = await SalesRecord.create({
      ...body,
      recordId,
      shopId,
      warrantyExpiryDate,
      warrantyStatus,
      createdBy: req.user.id
    });

    await logAudit({
      shopId,
      actor: req.user,
      action: 'SALES_RECORD_CREATE',
      targetType: 'SalesRecord',
      targetId: recordId,
      summary: `Registered sale & warranty ${recordId} for ${body.productName}`
    });

    return sendSuccess(res, newSale, 'Sales & warranty registered successfully', 201);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const listSales = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const {
      q,
      category,
      brand,
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

    if (from || to) {
      query.purchaseDate = {};
      if (from) query.purchaseDate.$gte = from;
      if (to) query.purchaseDate.$lte = to;
    }

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [
        { recordId: regex },
        { customerName: regex },
        { customerPhone: regex },
        { productName: regex },
        { brand: regex },
        { model: regex },
        { serialNumber: regex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      SalesRecord.countDocuments(query),
      SalesRecord.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    // Enhance items with current dynamic warranty status
    const formatted = items.map((item) => {
      const currentWarranty = getWarrantyStatus(item.warrantyExpiryDate);
      return {
        ...item,
        id: item.recordId,
        warrantyStatus: item.warrantyStatus === 'Claim Under Review' ? item.warrantyStatus : currentWarranty.status
      };
    });

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

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const sale = await SalesRecord.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    }).lean();

    if (!sale) {
      return sendError(res, 'NOT_FOUND', 'Sales record not found', [], 404);
    }

    const currentWarranty = getWarrantyStatus(sale.warrantyExpiryDate);

    return sendSuccess(res, {
      ...sale,
      id: sale.recordId,
      warrantyStatus: sale.warrantyStatus === 'Claim Under Review' ? sale.warrantyStatus : currentWarranty.status
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const sale = await SalesRecord.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!sale) {
      return sendError(res, 'NOT_FOUND', 'Sales record not found', [], 404);
    }

    const updates = req.body;
    delete updates.recordId;
    delete updates.shopId;

    // Recalculate warranty expiry if purchaseDate or warrantyDuration changed
    if (updates.purchaseDate || updates.warrantyDuration) {
      const pDate = updates.purchaseDate || sale.purchaseDate;
      const wDur = updates.warrantyDuration || sale.warrantyDuration;
      updates.warrantyExpiryDate = calculateWarrantyExpiry(pDate, wDur);
    }

    Object.assign(sale, updates);
    await sale.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'SALES_RECORD_UPDATE',
      targetType: 'SalesRecord',
      targetId: sale.recordId,
      summary: `Updated sales record ${sale.recordId}`
    });

    return sendSuccess(res, sale, 'Sales record updated successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
