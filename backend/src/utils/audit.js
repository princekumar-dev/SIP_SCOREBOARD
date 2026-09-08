const AuditLog = require("../models/AuditLog");

async function writeAudit(req, { action, entityType, entityId, oldValue, newValue, reason }) {
  await AuditLog.create({
    userId: req.user?._id,
    action,
    entityType,
    entityId: entityId ? String(entityId) : "",
    oldValue,
    newValue,
    reason: reason || "",
    ip: req.ip,
  });
}

module.exports = { writeAudit };
