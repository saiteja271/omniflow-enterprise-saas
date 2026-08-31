/**
 * Unified API Router & Request Dispatcher
 */

const { authenticate, authorize } = require('../middleware/auth');
const { resolveTenant } = require('../middleware/tenant');

const authController = require('../controllers/authController');
const hrmsController = require('../controllers/hrmsController');
const financeController = require('../controllers/financeController');
const projectController = require('../controllers/projectController');
const crmController = require('../controllers/crmController');
const approvalController = require('../controllers/approvalController');
const analyticsController = require('../controllers/analyticsController');

function handleApiRequest(req, res, pathname, query, body) {
  req.query = query;
  authenticate(req);
  resolveTenant(req);

  const method = req.method.toUpperCase();
  let result = null;

  // System Health
  if (pathname === '/api/health' && method === 'GET') {
    result = {
      status: 200,
      data: {
        status: 'UP',
        service: 'OmniFlow Enterprise Suite',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        tenant: req.tenant.name
      }
    };
  }

  // Auth & Tenants
  else if (pathname === '/api/auth/login' && method === 'POST') {
    result = authController.login(req, body);
  }
  else if (pathname === '/api/auth/me' && method === 'GET') {
    result = authController.getCurrentUser(req);
  }
  else if (pathname === '/api/tenants' && method === 'GET') {
    result = authController.getTenants(req);
  }
  else if (pathname === '/api/audit-logs' && method === 'GET') {
    result = authController.getAuditLogs(req);
  }

  // HRMS & Payroll
  else if (pathname === '/api/hrms/employees' && method === 'GET') {
    result = hrmsController.getEmployees(req);
  }
  else if (pathname === '/api/hrms/employees' && method === 'POST') {
    result = hrmsController.createEmployee(req, body);
  }
  else if (pathname === '/api/hrms/departments' && method === 'GET') {
    result = hrmsController.getDepartments(req);
  }
  else if (pathname === '/api/hrms/payroll/run' && method === 'POST') {
    result = hrmsController.runPayroll(req);
  }

  // Finance & Billing
  else if (pathname === '/api/finance/invoices' && method === 'GET') {
    result = financeController.getInvoices(req);
  }
  else if (pathname === '/api/finance/invoices' && method === 'POST') {
    result = financeController.createInvoice(req, body);
  }
  else if (pathname.startsWith('/api/finance/invoices/') && pathname.endsWith('/status') && method === 'PATCH') {
    const parts = pathname.split('/');
    const invoiceId = parts[parts.length - 2];
    result = financeController.updateInvoiceStatus(req, invoiceId, body);
  }
  else if (pathname === '/api/finance/overview' && method === 'GET') {
    result = financeController.getFinancialOverview(req);
  }

  // Projects & Tasks
  else if (pathname === '/api/projects' && method === 'GET') {
    result = projectController.getProjects(req);
  }
  else if (pathname === '/api/projects' && method === 'POST') {
    result = projectController.createProject(req, body);
  }
  else if (pathname === '/api/tasks' && method === 'GET') {
    result = projectController.getTasks(req);
  }
  else if (pathname === '/api/tasks' && method === 'POST') {
    result = projectController.createTask(req, body);
  }
  else if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/status') && method === 'PATCH') {
    const parts = pathname.split('/');
    const taskId = parts[parts.length - 2];
    result = projectController.updateTaskStatus(req, taskId, body);
  }

  // CRM & Sales
  else if (pathname === '/api/crm/leads' && method === 'GET') {
    result = crmController.getLeads(req);
  }
  else if (pathname === '/api/crm/leads' && method === 'POST') {
    result = crmController.createLead(req, body);
  }
  else if (pathname.startsWith('/api/crm/leads/') && pathname.endsWith('/stage') && method === 'PATCH') {
    const parts = pathname.split('/');
    const leadId = parts[parts.length - 2];
    result = crmController.updateLeadStage(req, leadId, body);
  }

  // Approvals & Workflow State Machine
  else if (pathname === '/api/approvals' && method === 'GET') {
    result = approvalController.getApprovals(req);
  }
  else if (pathname === '/api/approvals' && method === 'POST') {
    result = approvalController.createApproval(req, body);
  }
  else if (pathname.startsWith('/api/approvals/') && pathname.endsWith('/resolve') && method === 'POST') {
    const parts = pathname.split('/');
    const approvalId = parts[parts.length - 2];
    result = approvalController.resolveApproval(req, approvalId, body);
  }

  // AI & Executive Analytics
  else if (pathname === '/api/analytics/dashboard' && method === 'GET') {
    result = analyticsController.getDashboardMetrics(req);
  }

  // Unknown Endpoint
  if (!result) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: `Route ${method} ${pathname} not found` }));
  }

  res.writeHead(result.status || 200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(result.data));
}

module.exports = {
  handleApiRequest
};
