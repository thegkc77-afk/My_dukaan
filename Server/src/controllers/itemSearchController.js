import { searchTaglessItems } from '../services/searchService.js';
import { RepairOrder } from '../models/RepairOrder.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const searchItems = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { q = '', category, brand, status } = req.query;

    const results = await searchTaglessItems(shopId, q, {
      category,
      brand,
      status
    });

    return sendSuccess(res, results);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const item = await RepairOrder.findOne({
      shopId,
      $or: [{ recordId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])]
    }).lean();

    if (!item) {
      return sendError(res, 'NOT_FOUND', 'Item not found', [], 404);
    }

    return sendSuccess(res, {
      ...item,
      id: item.recordId
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
