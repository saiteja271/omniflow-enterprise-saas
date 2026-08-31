/**
 * OmniFlow REST API Client Layer
 */

const API = {
  baseUrl: '/api',
  currentTenantId: 'tenant-acme',
  authToken: 'usr-101',

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'x-tenant-id': this.currentTenantId,
      'Authorization': `Bearer ${this.authToken}`,
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth & Tenants
  getMe() { return this.request('/auth/me'); },
  getTenants() { return this.request('/tenants'); },
  getAuditLogs() { return this.request('/audit-logs'); },

  // Dashboard & Analytics
  getDashboardMetrics() { return this.request('/analytics/dashboard'); },

  // HRMS & Payroll
  getEmployees() { return this.request('/hrms/employees'); },
  getDepartments() { return this.request('/hrms/departments'); },
  createEmployee(payload) {
    return this.request('/hrms/employees', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  runPayroll() {
    return this.request('/hrms/payroll/run', { method: 'POST' });
  },

  // Finance & Invoices
  getInvoices() { return this.request('/finance/invoices'); },
  createInvoice(payload) {
    return this.request('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateInvoiceStatus(id, status) {
    return this.request(`/finance/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Projects & Tasks
  getProjects() { return this.request('/projects'); },
  createProject(payload) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getTasks() { return this.request('/tasks'); },
  createTask(payload) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateTaskStatus(id, status) {
    return this.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // CRM
  getLeads() { return this.request('/crm/leads'); },
  createLead(payload) {
    return this.request('/crm/leads', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateLeadStage(id, stage) {
    return this.request(`/crm/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage })
    });
  },

  // Approvals
  getApprovals() { return this.request('/approvals'); },
  createApproval(payload) {
    return this.request('/approvals', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  resolveApproval(id, action, resolutionComment) {
    return this.request(`/approvals/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, resolutionComment })
    });
  }
};
