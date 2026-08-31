/**
 * Multi-Tenant Isolation Middleware
 * Resolves tenant from header 'x-tenant-id', query param, or user session
 */

const db = require('../config/database');

function resolveTenant(req) {
  const headerTenant = req.headers['x-tenant-id'];
  const queryTenant = req.query && req.query.tenantId;
  const userTenant = req.user ? req.user.tenantId : null;

  const tenantId = headerTenant || queryTenant || userTenant || 'tenant-acme';
  
  let tenant = db.tenants.find(t => t.id === tenantId);
  if (!tenant) {
    tenant = db.tenants[0];
  }

  req.tenant = tenant;
  req.tenantId = tenant.id;
  return tenant;
}

module.exports = {
  resolveTenant
};
