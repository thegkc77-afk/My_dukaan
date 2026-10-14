import { SalesRecord } from '../models/SalesRecord.js';
import { WarrantyClaim } from '../models/WarrantyClaim.js';
import { getWarrantyStatus } from '../utils/dateUtils.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const lookupWarranty = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { q, serial, customer, brand, from, to } = req.query;

    const query = { shopId };

    if (serial) {
      query.serialNumber = { $regex: new RegExp(serial.trim(), 'i') };
    }

    if (customer) {
      query.customerName = { $regex: new RegExp(customer.trim(), 'i') };
    }

    if (brand) {
      query.brand = { $regex: new RegExp(brand.trim(), 'i') };
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
        { productName: regex },
        { brand: regex },
        { model: regex },
        { serialNumber: regex },
        { customerName: regex },
        { customerPhone: regex }
      ];
    }

    const records = await SalesRecord.find(query).sort({ purchaseDate: -1 }).limit(50).lean();

    const formatted = records.map((record) => {
      const warrantyDetails = getWarrantyStatus(record.warrantyExpiryDate);
      return {
        ...record,
        id: record.recordId,
        warrantyDetails,
        warrantyStatus: record.warrantyStatus === 'Claim Under Review' ? record.warrantyStatus : warrantyDetails.status
      };
    });

    return sendSuccess(res, formatted);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const getSaleWarranty = async (req, res) => {
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

    const claims = await WarrantyClaim.find({
      shopId,
      salesRecordId: sale.recordId
    }).lean();

    const warrantyDetails = getWarrantyStatus(sale.warrantyExpiryDate);

    return sendSuccess(res, {
      sale: {
        ...sale,
        id: sale.recordId
      },
      warrantyDetails,
      claims: claims.map((c) => ({ ...c, id: c.recordId }))
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
