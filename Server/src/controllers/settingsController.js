import bcrypt from 'bcryptjs';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { RepairOrder } from '../models/RepairOrder.js';
import { SalesRecord } from '../models/SalesRecord.js';
import { WarrantyClaim } from '../models/WarrantyClaim.js';
import { Handover } from '../models/Handover.js';
import { ENV } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const getSettings = async (req, res) => {
  try {
    const shop = await Shop.findById(req.user.shopId).lean();
    if (!shop) {
      return sendError(res, 'NOT_FOUND', 'Shop settings not found', [], 404);
    }

    return sendSuccess(res, {
      ...shop,
      shopName: shop.name,
      id: shop._id.toString()
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const updateSettings = async (req, res) => {
  try {
    const shop = await Shop.findById(req.user.shopId);
    if (!shop) {
      return sendError(res, 'NOT_FOUND', 'Shop not found', [], 404);
    }

    const updates = req.body;
    if (updates.shopName) updates.name = updates.shopName;

    Object.assign(shop, updates);
    await shop.save();

    await logAudit({
      shopId: shop._id,
      actor: req.user,
      action: 'SETTINGS_UPDATE',
      targetType: 'Shop',
      targetId: shop._id.toString(),
      summary: 'Updated shop settings and configurations'
    });

    return sendSuccess(res, {
      ...shop.toObject(),
      shopName: shop.name,
      id: shop._id.toString()
    }, 'Shop settings updated successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const listStaff = async (req, res) => {
  try {
    const staffUsers = await User.find({ shopId: req.user.shopId })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, staffUsers);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role = 'staff', phone } = req.body;
    const shopId = req.user.shopId;

    const existing = await User.findOne({ shopId, email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 'DUPLICATE_EMAIL', 'A staff member with this email already exists', [], 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      phone,
      shopId,
      isActive: true
    });

    // Also add to shop staffMembers display list if not present
    const shop = await Shop.findById(shopId);
    if (shop && !shop.staffMembers.includes(name.trim())) {
      shop.staffMembers.push(name.trim());
      await shop.save();
    }

    await logAudit({
      shopId,
      actor: req.user,
      action: 'STAFF_CREATE',
      targetType: 'User',
      targetId: newUser._id.toString(),
      summary: `Created new staff account for ${name} (${role})`
    });

    return sendSuccess(res, newUser, 'Staff account created successfully', 201);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;
    const { name, role, phone, password } = req.body;

    const staffUser = await User.findOne({ _id: id, shopId });
    if (!staffUser) {
      return sendError(res, 'NOT_FOUND', 'Staff member not found', [], 404);
    }

    if (name) staffUser.name = name.trim();
    if (role) staffUser.role = role;
    if (phone !== undefined) staffUser.phone = phone;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      staffUser.passwordHash = await bcrypt.hash(password, salt);
    }

    await staffUser.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'STAFF_UPDATE',
      targetType: 'User',
      targetId: staffUser._id.toString(),
      summary: `Updated staff profile for ${staffUser.name}`
    });

    return sendSuccess(res, staffUser, 'Staff account updated successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const toggleStaffActive = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.shopId;

    const staffUser = await User.findOne({ _id: id, shopId });
    if (!staffUser) {
      return sendError(res, 'NOT_FOUND', 'Staff member not found', [], 404);
    }

    if (staffUser._id.toString() === req.user.id) {
      return sendError(res, 'CANNOT_DEACTIVATE_SELF', 'You cannot deactivate your own account', [], 400);
    }

    staffUser.isActive = !staffUser.isActive;
    await staffUser.save();

    await logAudit({
      shopId,
      actor: req.user,
      action: 'STAFF_STATUS_CHANGE',
      targetType: 'User',
      targetId: staffUser._id.toString(),
      summary: `${staffUser.isActive ? 'Activated' : 'Deactivated'} staff account for ${staffUser.name}`
    });

    return sendSuccess(res, staffUser, `Staff account ${staffUser.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const exportBackup = async (req, res) => {
  try {
    const shopId = req.user.shopId;

    const [repairOrders, salesRecords, warrantyClaims, handoverRecords, shop] = await Promise.all([
      RepairOrder.find({ shopId }).lean(),
      SalesRecord.find({ shopId }).lean(),
      WarrantyClaim.find({ shopId }).lean(),
      Handover.find({ shopId }).lean(),
      Shop.findById(shopId).lean()
    ]);

    const backupDump = {
      exportDate: new Date().toISOString(),
      shopId,
      settings: shop,
      repairOrders: repairOrders.map((r) => ({ ...r, id: r.recordId })),
      salesRecords: salesRecords.map((s) => ({ ...s, id: s.recordId })),
      warrantyClaims: warrantyClaims.map((c) => ({ ...c, id: c.recordId })),
      handoverRecords: handoverRecords.map((h) => ({ ...h, id: h.recordId, orderId: h.repairOrderId }))
    };

    await logAudit({
      shopId,
      actor: req.user,
      action: 'BACKUP_EXPORT',
      targetType: 'Shop',
      targetId: shopId,
      summary: 'Exported shop data backup JSON'
    });

    return sendSuccess(res, backupDump, 'Backup exported successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const importBackup = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { repairOrders, salesRecords, warrantyClaims, handoverRecords, settings } = req.body;

    if (!repairOrders && !salesRecords && !warrantyClaims && !handoverRecords && !settings) {
      return sendError(res, 'INVALID_BACKUP', 'Invalid or empty backup payload', [], 400);
    }

    if (settings) {
      await Shop.findByIdAndUpdate(shopId, settings);
    }

    if (Array.isArray(repairOrders)) {
      for (const order of repairOrders) {
        const recordId = order.id || order.recordId;
        if (!recordId) continue;
        await RepairOrder.findOneAndUpdate(
          { shopId, recordId },
          { ...order, recordId, shopId },
          { upsert: true, new: true }
        );
      }
    }

    if (Array.isArray(salesRecords)) {
      for (const sale of salesRecords) {
        const recordId = sale.id || sale.recordId;
        if (!recordId) continue;
        await SalesRecord.findOneAndUpdate(
          { shopId, recordId },
          { ...sale, recordId, shopId },
          { upsert: true, new: true }
        );
      }
    }

    if (Array.isArray(warrantyClaims)) {
      for (const claim of warrantyClaims) {
        const recordId = claim.id || claim.recordId;
        if (!recordId) continue;
        await WarrantyClaim.findOneAndUpdate(
          { shopId, recordId },
          { ...claim, recordId, shopId },
          { upsert: true, new: true }
        );
      }
    }

    if (Array.isArray(handoverRecords)) {
      for (const handover of handoverRecords) {
        const recordId = handover.id || handover.recordId;
        const repairOrderId = handover.orderId || handover.repairOrderId;
        if (!recordId) continue;
        await Handover.findOneAndUpdate(
          { shopId, recordId },
          { ...handover, recordId, repairOrderId, shopId },
          { upsert: true, new: true }
        );
      }
    }

    await logAudit({
      shopId,
      actor: req.user,
      action: 'BACKUP_IMPORT',
      targetType: 'Shop',
      targetId: shopId,
      summary: 'Imported data from JSON backup'
    });

    return sendSuccess(res, {}, 'Backup imported successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};
