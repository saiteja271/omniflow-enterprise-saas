/**
 * Multi-Step Approvals & Workflow State Machine Controller
 */

const db = require('../config/database');
const { auditLog } = require('../middleware/auditLogger');

const approvalController = {
  getApprovals: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const approvals = db.approvals.filter(a => a.tenantId === tenantId);
    return { status: 200, data: approvals };
  },

  createApproval: (req, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const { type, title, amount, urgency, comments, department } = body || {};

    if (!title || !type) {
      return { status: 400, data: { error: 'Approval type and title are required' } };
    }

    const requester = req.user ? req.user.name : 'Sai Teja';
    const requesterId = req.user ? req.user.id : 'usr-101';

    const newApproval = {
      id: `appr-${String(db.approvals.length + 1).padStart(3, '0')}`,
      tenantId,
      type,
      requester,
      requesterId,
      department: department || (req.user ? req.user.department : 'Engineering'),
      title,
      amount: Number(amount) || 0,
      urgency: urgency || 'MEDIUM',
      status: 'PENDING',
      currentStep: 'Department Manager Review',
      createdAt: new Date().toISOString(),
      comments: comments || 'Automated enterprise submission.'
    };

    db.approvals.unshift(newApproval);
    auditLog(req, 'APPROVAL_SUBMITTED', newApproval.id, `Submitted ${newApproval.type}: ${newApproval.title}`);

    return { status: 201, data: { message: 'Approval request submitted', approval: newApproval } };
  },

  resolveApproval: (req, id, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const approval = db.approvals.find(a => a.id === id && a.tenantId === tenantId);

    if (!approval) {
      return { status: 404, data: { error: 'Approval request not found' } };
    }

    const { action, resolutionComment } = body || {};
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    
    approval.status = newStatus;
    approval.currentStep = newStatus === 'APPROVED' ? 'Finalized / Disbursed' : 'Rejected / Closed';
    approval.resolvedAt = new Date().toISOString();
    approval.resolver = req.user ? req.user.name : 'Sai Teja (Admin)';
    if (resolutionComment) approval.resolutionComment = resolutionComment;

    auditLog(req, `APPROVAL_${newStatus}`, approval.id, `${approval.title} was ${newStatus.toLowerCase()} by ${approval.resolver}`);

    return { status: 200, data: { message: `Request has been ${newStatus.toLowerCase()}`, approval } };
  }
};

module.exports = approvalController;
