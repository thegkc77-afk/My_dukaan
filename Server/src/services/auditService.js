import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  shopId,
  actor,
  action,
  targetType,
  targetId,
  summary,
  metadata = {}
}) => {
  try {
    if (!shopId) return;

    await AuditLog.create({
      shopId,
      actorId: actor?._id || actor?.id,
      actorName: actor?.name || 'System',
      actorRole: actor?.role || 'staff',
      action,
      targetType,
      targetId,
      summary,
      metadata
    });
  } catch (error) {
    console.error('[AuditLog] Error writing audit log:', error.message);
  }
};
