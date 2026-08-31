/**
 * CRM & Sales Pipeline Controller
 */

const db = require('../config/database');
const { auditLog } = require('../middleware/auditLogger');

const crmController = {
  getLeads: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const leads = db.leads.filter(l => l.tenantId === tenantId);
    return { status: 200, data: leads };
  },

  createLead: (req, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const { company, contactName, email, dealValue, stage, probability, source, notes } = body || {};

    if (!company || !contactName) {
      return { status: 400, data: { error: 'Company and contact name are required' } };
    }

    const newLead = {
      id: `lead-${String(db.leads.length + 1).padStart(2, '0')}`,
      tenantId,
      company,
      contactName,
      email: email || `${contactName.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      dealValue: Number(dealValue) || 50000,
      stage: stage || 'QUALIFIED',
      probability: Number(probability) || 50,
      source: source || 'Direct Web Inbound',
      notes: notes || 'Lead captured via OmniFlow Enterprise Portal.'
    };

    db.leads.unshift(newLead);
    auditLog(req, 'CRM_LEAD_CREATED', newLead.id, `Created lead for ${newLead.company} ($${newLead.dealValue})`);

    return { status: 201, data: { message: 'Lead added to CRM', lead: newLead } };
  },

  updateLeadStage: (req, id, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const lead = db.leads.find(l => l.id === id && l.tenantId === tenantId);

    if (!lead) {
      return { status: 404, data: { error: 'Lead not found' } };
    }

    const { stage } = body || {};
    lead.stage = stage || lead.stage;

    auditLog(req, 'CRM_LEAD_STAGE_UPDATED', lead.id, `Lead stage updated to ${lead.stage}`);

    return { status: 200, data: { message: 'Lead stage updated', lead } };
  }
};

module.exports = crmController;
