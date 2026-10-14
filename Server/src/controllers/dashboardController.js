import { RepairOrder } from '../models/RepairOrder.js';
import { SalesRecord } from '../models/SalesRecord.js';
import { WarrantyClaim } from '../models/WarrantyClaim.js';
import { Handover } from '../models/Handover.js';
import { getWarrantyStatus } from '../utils/dateUtils.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSummary = async (req, res) => {
  try {
    const shopId = req.user.shopId;

    const [
      totalRepairs,
      received,
      underRepair,
      readyForPickup,
      completedRepairs,
      sales,
      pendingClaims,
      totalHandovers
    ] = await Promise.all([
      RepairOrder.countDocuments({ shopId }),
      RepairOrder.countDocuments({ shopId, repairStatus: 'Received' }),
      RepairOrder.countDocuments({ shopId, repairStatus: 'Under Repair' }),
      RepairOrder.countDocuments({ shopId, repairStatus: 'Ready for Pickup' }),
      RepairOrder.countDocuments({ shopId, repairStatus: 'Completed' }),
      SalesRecord.find({ shopId }).select('warrantyExpiryDate').lean(),
      WarrantyClaim.countDocuments({
        shopId,
        claimStatus: { $in: ['Pending Verification', 'Under Review'] }
      }),
      Handover.countDocuments({ shopId })
    ]);

    const activeWarranties = sales.filter((s) => {
      const st = getWarrantyStatus(s.warrantyExpiryDate);
      return st.isActive;
    }).length;

    const stats = {
      totalRepairs,
      received,
      underRepair,
      readyForPickup,
      completedRepairs,
      activeWarranties,
      pendingClaims,
      totalHandovers
    };

    return sendSuccess(res, stats);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const getRecentRepairs = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const repairs = await RepairOrder.find({ shopId: req.user.shopId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = repairs.map((r) => ({
      ...r,
      id: r.recordId
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const getRecentClaims = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const claims = await WarrantyClaim.find({ shopId: req.user.shopId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = claims.map((c) => ({
      ...c,
      id: c.recordId
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
