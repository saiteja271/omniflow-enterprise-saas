/**
 * Enterprise Audit Logger Middleware
 */

const db = require('../config/database');

function auditLog(req, action, resource, details) {
  const tenantId = req.tenantId || (req.user ? req.user.tenantId : 'tenant-acme');
  const userId = req.user ? req.user.id : 'ANONYMOUS';
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  return db.logAudit(tenantId, userId, action, resource, details, ipAddress);
}

module.exports = {
  auditLog
};
