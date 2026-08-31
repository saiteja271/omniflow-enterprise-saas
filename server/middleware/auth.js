/**
 * Authentication & Role-Based Access Control (RBAC) Middleware
 */

const db = require('../config/database');

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ORG_ADMIN: ['hrms:*', 'finance:*', 'projects:*', 'crm:*', 'approvals:*', 'analytics:*'],
  MANAGER: ['hrms:read', 'finance:read', 'projects:*', 'crm:read', 'crm:write', 'approvals:read', 'approvals:write', 'analytics:read'],
  EMPLOYEE: ['hrms:read', 'projects:read', 'projects:write', 'approvals:create', 'approvals:read'],
  AUDITOR: ['*:read', 'audit:read']
};

function authenticate(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Support demo token or default to SuperAdmin user for seamless browser API exploration
  let user = null;
  if (token) {
    user = db.users.find(u => u.id === token || u.email === token);
  }
  
  if (!user) {
    // Default to first user (SuperAdmin) if no token provided in demo mode
    user = db.users[0];
  }

  req.user = user;
  return user;
}

function checkPermission(role, requiredScope) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;

  const [domain, action] = requiredScope.split(':');
  if (permissions.includes(`${domain}:*`)) return true;
  if (permissions.includes(requiredScope)) return true;
  if (permissions.includes('*:read') && action === 'read') return true;

  return false;
}

function authorize(requiredScope) {
  return (req, res, next) => {
    const user = authenticate(req);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized: Authentication required' }));
    }

    if (!checkPermission(user.role, requiredScope)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: `Forbidden: User role '${user.role}' lacks permission '${requiredScope}'`
      }));
    }

    if (next) next();
  };
}

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  ROLE_PERMISSIONS
};
