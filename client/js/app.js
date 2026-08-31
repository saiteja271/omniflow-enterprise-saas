/**
 * OmniFlow Enterprise Application State & UI Controller
 */

const App = {
  activeView: 'dashboard',
  cache: {},

  init() {
    this.bindNavigation();
    this.bindModals();
    this.renderView('dashboard');
  },

  bindNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.renderView(view);
      });
    });

    const tenantSelect = document.getElementById('tenant-selector');
    if (tenantSelect) {
      tenantSelect.addEventListener('change', (e) => {
        API.currentTenantId = e.target.value;
        this.showToast(`Switched Tenant context to ${e.target.options[e.target.selectedIndex].text}`);
        this.renderView(this.activeView);
      });
    }
  },

  bindModals() {
    document.querySelectorAll('[data-modal-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal-target');
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
      });
    });

    document.querySelectorAll('.modal-overlay .close-btn, .modal-overlay .btn-secondary').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  },

  async renderView(viewName) {
    this.activeView = viewName;
    
    // Update active nav styling
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (activeNav) activeNav.classList.add('active');

    const container = document.getElementById('view-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#9ca3af;">Loading OmniFlow Enterprise Service...</div>';

    try {
      if (viewName === 'dashboard') await this.renderDashboard(container);
      else if (viewName === 'hrms') await this.renderHRMS(container);
      else if (viewName === 'finance') await this.renderFinance(container);
      else if (viewName === 'projects') await this.renderProjects(container);
      else if (viewName === 'crm') await this.renderCRM(container);
      else if (viewName === 'approvals') await this.renderApprovals(container);
      else if (viewName === 'audit') await this.renderAudit(container);
      else if (viewName === 'api-docs') this.renderApiDocs(container);
    } catch (err) {
      container.innerHTML = `<div class="card" style="border-left:4px solid var(--danger);">
        <h3>Failed to load module</h3>
        <p style="color:var(--text-secondary);margin-top:8px;">${err.message}</p>
      </div>`;
    }
  },

  // 1. Dashboard View
  async renderDashboard(container) {
    const data = await API.getDashboardMetrics();
    const { kpis, aiInsights } = data;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>Executive Enterprise Dashboard</h1>
          <p>Real-time consolidated analytics across Multi-Tenant ERP & SaaS operations</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" onclick="App.runQuickPayroll()">⚡ Run Monthly Payroll</button>
          <button class="btn btn-secondary" onclick="App.openModal('modal-add-invoice')">+ New Invoice</button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Booked Revenue</span>
            <span class="kpi-badge up">↑ +24.8%</span>
          </div>
          <div class="kpi-value">$${kpis.totalRevenue.toLocaleString()}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">GAAP Audited Ledger</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>CRM Pipeline Value</span>
            <span class="kpi-badge purple">Weighted</span>
          </div>
          <div class="kpi-value">$${kpis.pipelineValue.toLocaleString()}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">From enterprise RFPs</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>Active Workforce</span>
            <span class="kpi-badge up">100% Active</span>
          </div>
          <div class="kpi-value">${kpis.activeEmployees}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Across 4 Departments</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>Pending Approvals</span>
            <span class="kpi-badge pending">${kpis.pendingApprovals} Action Req</span>
          </div>
          <div class="kpi-value">${kpis.pendingApprovals}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Multi-Tier Workflow State</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>🧠 OmniFlow AI Executive Copilot & Decision Insights</span>
          <span class="badge badge-info">Realtime LLM Inference</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px;">
          ${aiInsights.map(insight => `
            <div style="background:rgba(31, 41, 55, 0.4);border:1px solid var(--border);border-radius:8px;padding:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong style="font-size:0.9rem;color:#818cf8;">${insight.title}</strong>
                <span class="badge ${insight.type === 'OPPORTUNITY' ? 'badge-success' : insight.type === 'CASHFLOW_ALERT' ? 'badge-danger' : 'badge-warning'}">
                  ${insight.confidence}% Confidence
                </span>
              </div>
              <p style="font-size:0.84rem;color:var(--text-secondary);line-height:1.4;">${insight.description}</p>
              <div style="margin-top:12px;font-size:0.78rem;color:#10b981;font-weight:600;">
                💡 Action: ${insight.actionRecommended}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 2. HRMS View
  async renderHRMS(container) {
    const employees = await API.getEmployees();
    const departments = await API.getDepartments();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>Human Resource Management System (HRMS)</h1>
          <p>Directory, Role Assignments, Compensation & Payroll Disbursement</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-secondary" onclick="App.runQuickPayroll()">💵 Disburse Payroll</button>
          <button class="btn btn-primary" onclick="App.openModal('modal-add-employee')">+ Add Employee</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Enterprise Employee Directory</span>
          <span class="badge badge-info">${employees.length} Members</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Base Salary</th>
              <th>Performance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(e => `
              <tr>
                <td><code style="color:#818cf8;">${e.id}</code></td>
                <td><strong>${e.fullName}</strong><div style="font-size:0.75rem;color:var(--text-muted);">${e.email}</div></td>
                <td>${e.designation}</td>
                <td><span class="badge badge-info">${e.department}</span></td>
                <td>$${e.salary.toLocaleString()} / yr</td>
                <td><span style="color:#10b981;font-weight:700;">${e.performanceScore}%</span></td>
                <td><span class="badge badge-success">${e.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 3. Finance & Invoices View
  async renderFinance(container) {
    const invoices = await API.getInvoices();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>Finance, Invoicing & Subscription Billing</h1>
          <p>Multi-tenant accounts receivable, ledger tracking, and automated billing</p>
        </div>
        <button class="btn btn-primary" onclick="App.openModal('modal-add-invoice')">+ Generate Invoice</button>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Corporate Invoice Register</span>
          <span class="badge badge-info">${invoices.length} Invoices</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client / Account</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Subtotal</th>
              <th>Total (Inc Tax)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(inv => `
              <tr>
                <td><code style="color:#818cf8;font-weight:bold;">${inv.id}</code></td>
                <td><strong>${inv.clientName}</strong><div style="font-size:0.75rem;color:var(--text-muted);">${inv.clientEmail}</div></td>
                <td>${inv.issueDate}</td>
                <td>${inv.dueDate}</td>
                <td>$${inv.amount.toLocaleString()}</td>
                <td><strong>$${inv.total.toLocaleString()}</strong></td>
                <td>
                  <span class="badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}">
                    ${inv.status}
                  </span>
                </td>
                <td>
                  ${inv.status !== 'PAID' ? `
                    <button class="btn btn-secondary" style="padding:4px 10px;font-size:0.75rem;" onclick="App.markInvoicePaid('${inv.id}')">
                      Mark Paid
                    </button>
                  ` : '<span style="color:#10b981;font-size:0.8rem;">✓ Settled</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 4. Projects & Sprints View
  async renderProjects(container) {
    const projects = await API.getProjects();
    const tasks = await API.getTasks();

    const columns = [
      { id: 'TODO', title: 'To Do', badge: 'badge-info' },
      { id: 'IN_PROGRESS', title: 'In Progress', badge: 'badge-warning' },
      { id: 'REVIEW', title: 'Code Review', badge: 'badge-info' },
      { id: 'DONE', title: 'Completed', badge: 'badge-success' }
    ];

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>Projects, Sprints & Agile Kanban</h1>
          <p>Strategic cross-department initiative management and task queues</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-secondary" onclick="App.openModal('modal-add-project')">+ New Project</button>
          <button class="btn btn-primary" onclick="App.openModal('modal-add-task')">+ Add Task</button>
        </div>
      </div>

      <div class="kanban-grid">
        ${columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return `
            <div class="kanban-col">
              <div class="kanban-col-header">
                <span>${col.title}</span>
                <span class="badge ${col.badge}">${colTasks.length}</span>
              </div>
              <div class="kanban-tasks">
                ${colTasks.map(t => `
                  <div class="kanban-task">
                    <h4>${t.title}</h4>
                    <div class="kanban-task-meta">
                      <span>👤 ${t.assignee}</span>
                      <span class="badge ${t.priority === 'URGENT' || t.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${t.priority}</span>
                    </div>
                    <div style="margin-top:10px;display:flex;justify-content:flex-end;gap:6px;">
                      ${col.id !== 'DONE' ? `
                        <button class="btn btn-secondary" style="padding:2px 8px;font-size:0.7rem;" onclick="App.advanceTask('${t.id}', '${col.id}')">
                          Next ➔
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // 5. CRM View
  async renderCRM(container) {
    const leads = await API.getLeads();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>Enterprise CRM & Sales Pipeline</h1>
          <p>Account tracking, deal progression, and sales revenue probability</p>
        </div>
        <button class="btn btn-primary" onclick="App.openModal('modal-add-lead')">+ Add Prospect / Lead</button>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Active Enterprise Deal Pipeline</span>
          <span class="badge badge-info">${leads.length} Active Deals</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Key Contact</th>
              <th>Deal Value</th>
              <th>Pipeline Stage</th>
              <th>Probability</th>
              <th>Lead Source</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(l => `
              <tr>
                <td><strong>${l.company}</strong></td>
                <td>${l.contactName}<div style="font-size:0.75rem;color:var(--text-muted);">${l.email}</div></td>
                <td><strong style="color:#10b981;">$${l.dealValue.toLocaleString()}</strong></td>
                <td><span class="badge badge-warning">${l.stage}</span></td>
                <td><strong>${l.probability}%</strong></td>
                <td>${l.source}</td>
                <td>
                  <button class="btn btn-secondary" style="padding:4px 10px;font-size:0.75rem;" onclick="App.advanceLead('${l.id}', '${l.stage}')">
                    Advance Stage ➔
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 6. Approvals View
  async renderApprovals(container) {
    const approvals = await API.getApprovals();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>Workflow Automation & Approval Engine</h1>
          <p>Multi-step state machine for CapEx, Leave, and Purchase Orders</p>
        </div>
        <button class="btn btn-primary" onclick="App.openModal('modal-add-approval')">+ Submit Request</button>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Approval Queue</span>
          <span class="badge badge-info">${approvals.length} Total</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Req ID</th>
              <th>Request Type</th>
              <th>Title & Justification</th>
              <th>Requester</th>
              <th>Amount</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${approvals.map(a => `
              <tr>
                <td><code style="color:#818cf8;">${a.id}</code></td>
                <td><span class="badge badge-info">${a.type}</span></td>
                <td>
                  <strong>${a.title}</strong>
                  <div style="font-size:0.75rem;color:var(--text-muted);">${a.comments || ''}</div>
                </td>
                <td>${a.requester}<div style="font-size:0.75rem;color:var(--text-muted);">${a.department}</div></td>
                <td>${a.amount > 0 ? `$${a.amount.toLocaleString()}` : 'N/A'}</td>
                <td><span class="badge ${a.urgency === 'HIGH' ? 'badge-danger' : 'badge-warning'}">${a.urgency}</span></td>
                <td>
                  <span class="badge ${a.status === 'APPROVED' ? 'badge-success' : a.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}">
                    ${a.status}
                  </span>
                </td>
                <td>
                  ${a.status === 'PENDING' ? `
                    <div style="display:flex;gap:6px;">
                      <button class="btn btn-success" style="padding:4px 10px;font-size:0.75rem;" onclick="App.resolveApprovalReq('${a.id}', 'APPROVE')">Approve</button>
                      <button class="btn btn-danger" style="padding:4px 10px;font-size:0.75rem;" onclick="App.resolveApprovalReq('${a.id}', 'REJECT')">Reject</button>
                    </div>
                  ` : `<span style="font-size:0.75rem;color:var(--text-muted);">${a.currentStep}</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 7. Audit Log View
  async renderAudit(container) {
    const logs = await API.getAuditLogs();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>Security Audit & Activity Logs</h1>
          <p>Immutable enterprise compliance trail for SOC2 & ISO27001 readiness</p>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Tenant Activity Trail</span>
          <span class="badge badge-info">${logs.length} Records</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Action</th>
              <th>User</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => `
              <tr>
                <td><code style="color:#818cf8;">${l.id}</code></td>
                <td><span class="badge badge-info">${l.action}</span></td>
                <td>${l.userId}</td>
                <td><code>${l.resource}</code></td>
                <td>${l.details}</td>
                <td><span style="font-size:0.8rem;color:var(--text-muted);">${l.ipAddress}</span></td>
                <td style="font-size:0.75rem;color:var(--text-muted);">${new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 8. API Docs
  renderApiDocs(container) {
    container.innerHTML = `
      <div class="view-header">
        <div class="view-title">
          <h1>OmniFlow REST API & Gateway Documentation</h1>
          <p>Explore production-grade enterprise endpoints</p>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Endpoint Registry</div>
        <div style="font-family:monospace;font-size:0.88rem;display:flex;flex-direction:column;gap:12px;">
          <div><span class="badge badge-success">GET</span> <code>/api/health</code> - System status & tenant info</div>
          <div><span class="badge badge-success">GET</span> <code>/api/analytics/dashboard</code> - Consolidated KPIs & AI insights</div>
          <div><span class="badge badge-success">GET</span> <code>/api/hrms/employees</code> - List employees & salaries</div>
          <div><span class="badge badge-info">POST</span> <code>/api/hrms/payroll/run</code> - Run automated monthly payroll</div>
          <div><span class="badge badge-success">GET</span> <code>/api/finance/invoices</code> - Retrieve multi-tenant invoices</div>
          <div><span class="badge badge-info">POST</span> <code>/api/finance/invoices</code> - Generate compliant invoice</div>
          <div><span class="badge badge-success">GET</span> <code>/api/projects</code> - Project initiatives</div>
          <div><span class="badge badge-success">GET</span> <code>/api/tasks</code> - Agile Kanban task queue</div>
          <div><span class="badge badge-success">GET</span> <code>/api/crm/leads</code> - Sales pipeline deals</div>
          <div><span class="badge badge-success">GET</span> <code>/api/approvals</code> - Multi-tier approval requests</div>
          <div><span class="badge badge-info">POST</span> <code>/api/approvals/:id/resolve</code> - Approve or Reject request</div>
          <div><span class="badge badge-success">GET</span> <code>/api/audit-logs</code> - Compliance trail</div>
        </div>
      </div>
    `;
  },

  // Quick Action Handlers
  async runQuickPayroll() {
    try {
      const res = await API.runPayroll();
      this.showToast(`✅ Payroll disbursed for ${res.employeeCount} employees ($${res.totalDisbursed.toLocaleString()})`);
      this.renderView(this.activeView);
    } catch (err) {
      this.showToast(`❌ Error: ${err.message}`);
    }
  },

  async markInvoicePaid(id) {
    try {
      await API.updateInvoiceStatus(id, 'PAID');
      this.showToast(`✅ Invoice ${id} marked as PAID`);
      this.renderView(this.activeView);
    } catch (err) {
      this.showToast(`❌ Error: ${err.message}`);
    }
  },

  async advanceTask(id, currentStatus) {
    const nextMap = { 'TODO': 'IN_PROGRESS', 'IN_PROGRESS': 'REVIEW', 'REVIEW': 'DONE' };
    const nextStatus = nextMap[currentStatus];
    if (!nextStatus) return;
    try {
      await API.updateTaskStatus(id, nextStatus);
      this.showToast(`Task moved to ${nextStatus}`);
      this.renderView(this.activeView);
    } catch (err) {
      this.showToast(`❌ Error: ${err.message}`);
    }
  },

  async advanceLead(id, currentStage) {
    const nextStageMap = { 'QUALIFIED': 'PROPOSAL_SENT', 'PROPOSAL_SENT': 'NEGOTIATION', 'NEGOTIATION': 'CLOSED_WON' };
    const nextStage = nextStageMap[currentStage] || 'CLOSED_WON';
    try {
      await API.updateLeadStage(id, nextStage);
      this.showToast(`Lead moved to ${nextStage}`);
      this.renderView(this.activeView);
    } catch (err) {
      this.showToast(`❌ Error: ${err.message}`);
    }
  },

  async resolveApprovalReq(id, action) {
    try {
      await API.resolveApproval(id, action);
      this.showToast(`Request ${id} ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`);
      this.renderView(this.activeView);
    } catch (err) {
      this.showToast(`❌ Error: ${err.message}`);
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
