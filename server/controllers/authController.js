/**
 * Auth Controller - User Sessions & Token Management
 */

const db = require('../config/database');
const { auditLog } = require('../middleware/auditLogger');

const authController = {
  login: (req, body) => {
    const { email, password } = body || {};
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user) {
      return { status: 401, data: { error: 'Invalid credentials or user not found' } };
    }

    const token = `token-${user.id}-${Date.now()}`;
    auditLog(req, 'USER_LOGIN', user.email, `User ${user.name} authenticated successfully`);

    return {
      status: 200,
      data: {
        message: 'Authentication successful',
        token: user.id, // using user.id as token key for deterministic demo
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar
        }
      }
    };
  },

  getCurrentUser: (req) => {
    const user = req.user || db.users[0];
    return {
      status: 200,
      data: {
        user,
        tenant: req.tenant || db.tenants[0]
      }
    };
  },

  getTenants: (req) => {
    return {
      status: 200,
      data: db.tenants
    };
  },

  getAuditLogs: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const logs = db.auditLogs.filter(l => l.tenantId === tenantId);
    return {
      status: 200,
      data: logs
    };
  }
};

module.exports = authController;
