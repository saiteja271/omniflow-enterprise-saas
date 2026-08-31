/**
 * Finance, Billing & Invoicing Controller
 */

const db = require('../config/database');
const { auditLog } = require('../middleware/auditLogger');

const financeController = {
  getInvoices: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const invoices = db.invoices.filter(i => i.tenantId === tenantId);
    return { status: 200, data: invoices };
  },

  createInvoice: (req, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const { clientName, clientEmail, amount, items, dueDate } = body || {};

    if (!clientName || !amount) {
      return { status: 400, data: { error: 'Client name and amount are required' } };
    }

    const subtotal = Number(amount);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;

    const newInvoice = {
      id: `INV-2026-${String(db.invoices.length + 1).padStart(3, '0')}`,
      tenantId,
      clientName,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      amount: subtotal,
      tax,
      total,
      status: 'PENDING',
      items: items && items.length ? items : [
        { description: 'OmniFlow Enterprise Service Subscription', qty: 1, rate: subtotal }
      ]
    };

    db.invoices.unshift(newInvoice);
    auditLog(req, 'INVOICE_CREATED', newInvoice.id, `Created invoice for ${newInvoice.clientName} ($${newInvoice.total})`);

    return { status: 201, data: { message: 'Invoice generated successfully', invoice: newInvoice } };
  },

  updateInvoiceStatus: (req, id, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const invoice = db.invoices.find(i => i.id === id && i.tenantId === tenantId);

    if (!invoice) {
      return { status: 404, data: { error: 'Invoice not found' } };
    }

    const { status } = body || {};
    invoice.status = status || 'PAID';

    auditLog(req, 'INVOICE_STATUS_UPDATED', invoice.id, `Invoice ${invoice.id} marked as ${invoice.status}`);

    return { status: 200, data: { message: `Invoice marked as ${invoice.status}`, invoice } };
  },

  getFinancialOverview: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const invoices = db.invoices.filter(i => i.tenantId === tenantId);

    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);
    const pendingRevenue = invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.total, 0);
    const overdueRevenue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.total, 0);

    return {
      status: 200,
      data: {
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        totalInvoices: invoices.length,
        paidCount: invoices.filter(i => i.status === 'PAID').length
      }
    };
  }
};

module.exports = financeController;
