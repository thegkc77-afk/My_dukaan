import { WarrantyClaim } from '../models/WarrantyClaim.js';
import { SalesRecord } from '../models/SalesRecord.js';
import { generateRecordId } from '../utils/generateRecordId.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const createClaim = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const body = req.body;

    // Verify linked sales record exists and belongs to this shop
    const sale = await SalesRecord.findOne({
      shopId,
      recordId: body.salesRecordId
    });

    if (!sale) {
      return sendError(
        res,
        'SALES_RECORD_NOT_FOUND',
        `Sales record ${body.salesRecordId} does not exist in this shop`,
        [],
        404
      );
    }

    let recordId = body.id;
    if (recordId) {
      const exists = await WarrantyClaim.findOne({ shopId, recordId });
      if (exists) {
        recordId = await generateRecordId(WarrantyClaim, 'CLM', shopId, 3);
      }
    } else {
      recordId = await generateRecordId(WarrantyClaim, 'CLM', shopId, 3);
    }

    const initialHistoryEntry = {
      date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: body.claimStatus || 'Pending Verification',
      staff: req.user.name,
      note: 'Claim initiated and logged in system.'
    };

    const newClaim = await WarrantyClaim.create({
      ...body,
      recordId,
      shopId,
      history: [initialHistoryEntry],
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    // Mark sales record status as Claim Under Review
    sale.warrantyStatus = 'Claim Under Review';
    await sale.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'WARRANTY_CLAIM_CREATE',
      targetType: 'WarrantyClaim',
      targetId: recordId,
      summary: `Logged warranty claim ${recordId} for ${body.productName}`
    });

    return sendSuccess(res, newClaim, 'Warranty claim registered successfully', 201);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const listClaims = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const {
      q,
      status,
      salesRecordId,
      from,
      to,
      page = 1,
      limit = 100,
      sort = '-createdAt'
    } = req.query;

    const query = { shopId };

    if (status && status !== 'All') {
      query.claimStatus = status;
    }

    if (salesRecordId) {
      query.salesRecordId = salesRecordId;
    }

    if (from || to) {
      query.claimDate = {};
      if (from) query.claimDate.$gte = from;
      if (to) query.claimDate.$lte = to;
    }

    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [
        { recordId: regex },
        { salesRecordId: regex },
        { productName: regex },
        { customerName: regex },
        { customerPhone: regex },
        { defectReported: regex },
        { damageDescription: regex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      WarrantyClaim.countDocuments(query),
      WarrantyClaim.find(query)
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

export const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const claim = await WarrantyClaim.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    }).lean();

    if (!claim) {
      return sendError(res, 'NOT_FOUND', 'Warranty claim not found', [], 404);
    }

    return sendSuccess(res, {
      ...claim,
      id: claim.recordId
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const updateClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const claim = await WarrantyClaim.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!claim) {
      return sendError(res, 'NOT_FOUND', 'Warranty claim not found', [], 404);
    }

    const updates = req.body;
    delete updates.recordId;
    delete updates.shopId;
    delete updates.claimStatus; // status updates must use status endpoint

    Object.assign(claim, updates);
    claim.updatedBy = req.user.id;
    await claim.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'WARRANTY_CLAIM_UPDATE',
      targetType: 'WarrantyClaim',
      targetId: claim.recordId,
      summary: `Updated warranty claim ${claim.recordId}`
    });

    return sendSuccess(res, claim, 'Warranty claim updated successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staff, note } = req.body;
    const shopId = req.user.shopId;

    const claim = await WarrantyClaim.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    });

    if (!claim) {
      return sendError(res, 'NOT_FOUND', 'Warranty claim not found', [], 404);
    }

    const previousStatus = claim.claimStatus;
    claim.claimStatus = status;

    const historyEntry = {
      date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status,
      staff: staff || req.user.name,
      note: note || `Status updated to ${status}`
    };

    claim.history.push(historyEntry);
    claim.updatedBy = req.user.id;
    await claim.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'WARRANTY_CLAIM_STATUS_CHANGE',
      targetType: 'WarrantyClaim',
      targetId: claim.recordId,
      summary: `Warranty claim ${claim.recordId} status updated from ${previousStatus} to ${status}`
    });

    return sendSuccess(res, claim, `Claim status updated to ${status}`);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
