/**
 * OmniFlow Database & Data Store Engine
 * Multi-tenant in-memory data store with realistic enterprise seed data
 */

const crypto = require('crypto');

class DatabaseStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.tenants = [
      { id: 'tenant-acme', name: 'Acme Global Technologies', plan: 'ENTERPRISE', status: 'ACTIVE', createdAt: '2025-01-15' },
      { id: 'tenant-apex', name: 'Apex NextGen Labs', plan: 'BUSINESS_PRO', status: 'ACTIVE', createdAt: '2025-02-01' }
    ];

    this.users = [
      {
        id: 'usr-101',
        tenantId: 'tenant-acme',
        email: 'admin@acme.corp',
        name: 'Sai Teja (Lead Architect)',
        role: 'SUPER_ADMIN',
        department: 'Executive',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-102',
        tenantId: 'tenant-acme',
        email: 'sarah.connor@acme.corp',
        name: 'Sarah Connor',
        role: 'ORG_ADMIN',
        department: 'Operations & HR',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-103',
        tenantId: 'tenant-acme',
        email: 'david.chen@acme.corp',
        name: 'David Chen',
        role: 'MANAGER',
        department: 'Engineering',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-104',
        tenantId: 'tenant-acme',
        email: 'elena.rostova@acme.corp',
        name: 'Elena Rostova',
        role: 'EMPLOYEE',
        department: 'Product Design',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      }
    ];

    this.departments = [
      { id: 'dept-1', tenantId: 'tenant-acme', name: 'Engineering', code: 'ENG', head: 'David Chen', budget: 450000 },
      { id: 'dept-2', tenantId: 'tenant-acme', name: 'Product & Design', code: 'PROD', head: 'Elena Rostova', budget: 220000 },
      { id: 'dept-3', tenantId: 'tenant-acme', name: 'Sales & Marketing', code: 'SALES', head: 'Marcus Vance', budget: 380000 },
      { id: 'dept-4', tenantId: 'tenant-acme', name: 'Finance & Legal', code: 'FIN', head: 'Rachel Green', budget: 190000 }
    ];

    this.employees = [
      {
        id: 'emp-001',
        tenantId: 'tenant-acme',
        userId: 'usr-101',
        fullName: 'Sai Teja',
        designation: 'Principal Solutions Architect',
        department: 'Engineering',
        email: 'admin@acme.corp',
        salary: 165000,
        joinDate: '2023-03-15',
        status: 'ACTIVE',
        performanceScore: 98
      },
      {
        id: 'emp-002',
        tenantId: 'tenant-acme',
        userId: 'usr-102',
        fullName: 'Sarah Connor',
        designation: 'Head of People & Operations',
        department: 'Finance & Legal',
        email: 'sarah.connor@acme.corp',
        salary: 135000,
        joinDate: '2023-06-01',
        status: 'ACTIVE',
        performanceScore: 94
      },
      {
        id: 'emp-003',
        tenantId: 'tenant-acme',
        userId: 'usr-103',
        fullName: 'David Chen',
        designation: 'Senior Engineering Manager',
        department: 'Engineering',
        email: 'david.chen@acme.corp',
        salary: 152000,
        joinDate: '2023-08-10',
        status: 'ACTIVE',
        performanceScore: 91
      },
      {
        id: 'emp-004',
        tenantId: 'tenant-acme',
        userId: 'usr-104',
        fullName: 'Elena Rostova',
        designation: 'Lead Product Designer',
        department: 'Product & Design',
        email: 'elena.rostova@acme.corp',
        salary: 118000,
        joinDate: '2024-01-20',
        status: 'ACTIVE',
        performanceScore: 96
      },
      {
        id: 'emp-005',
        tenantId: 'tenant-acme',
        fullName: 'Marcus Vance',
        designation: 'VP of Global Sales',
        department: 'Sales & Marketing',
        email: 'marcus.v@acme.corp',
        salary: 140000,
        joinDate: '2024-02-15',
        status: 'ACTIVE',
        performanceScore: 89
      }
    ];

    this.invoices = [
      {
        id: 'INV-2026-001',
        tenantId: 'tenant-acme',
        clientName: 'Starlight Financial Inc',
        clientEmail: 'billing@starlight.io',
        issueDate: '2026-08-01',
        dueDate: '2026-08-31',
        amount: 34500.00,
        tax: 2760.00,
        total: 37260.00,
        status: 'PAID',
        items: [
          { description: 'OmniFlow Enterprise Multi-Tenant License (Annual)', qty: 1, rate: 30000.00 },
          { description: 'Dedicated AI Inference Gateway SLA', qty: 1, rate: 4500.00 }
        ]
      },
      {
        id: 'INV-2026-002',
        tenantId: 'tenant-acme',
        clientName: 'HyperScale Logistics Group',
        clientEmail: 'accounts@hyperscale.com',
        issueDate: '2026-08-15',
        dueDate: '2026-09-15',
        amount: 18200.00,
        tax: 1456.00,
        total: 19656.00,
        status: 'PENDING',
        items: [
          { description: 'ERP Integration & Custom Connector Suite', qty: 1, rate: 15000.00 },
          { description: 'Tier-1 24/7 Enterprise Support Package', qty: 1, rate: 3200.00 }
        ]
      },
      {
        id: 'INV-2026-003',
        tenantId: 'tenant-acme',
        clientName: 'Nexus Health Systems',
        clientEmail: 'procure@nexushealth.org',
        issueDate: '2026-08-20',
        dueDate: '2026-09-20',
        amount: 52000.00,
        tax: 4160.00,
        total: 56160.00,
        status: 'OVERDUE',
        items: [
          { description: 'HIPAA-Compliant Private Cloud SaaS Instance', qty: 1, rate: 48000.00 },
          { description: 'Staff Onboarding & Security Training', qty: 1, rate: 4000.00 }
        ]
      }
    ];

    this.projects = [
      {
        id: 'proj-01',
        tenantId: 'tenant-acme',
        title: 'OmniFlow 2.0 Realtime Architecture',
        description: 'Refactor core event dispatching pipeline to support 100k msg/sec with distributed Redis streams.',
        department: 'Engineering',
        progress: 82,
        priority: 'CRITICAL',
        status: 'ACTIVE',
        lead: 'Sai Teja',
        budget: 95000,
        deadline: '2026-09-30'
      },
      {
        id: 'proj-02',
        tenantId: 'tenant-acme',
        title: 'Enterprise Billing & Multi-Currency Engine',
        description: 'Implement automated SEPA, Stripe, ACH and crypto settlement pipelines with GAAP compliant ledgers.',
        department: 'Finance & Legal',
        progress: 65,
        priority: 'HIGH',
        status: 'ACTIVE',
        lead: 'Sarah Connor',
        budget: 60000,
        deadline: '2026-10-15'
      },
      {
        id: 'proj-03',
        tenantId: 'tenant-acme',
        title: 'Design System & Micro-Frontend Migration',
        description: 'Standardize enterprise UI component token libraries across web, mobile and desktop surfaces.',
        department: 'Product & Design',
        progress: 90,
        priority: 'MEDIUM',
        status: 'IN_REVIEW',
        lead: 'Elena Rostova',
        budget: 45000,
        deadline: '2026-09-10'
      }
    ];

    this.tasks = [
      {
        id: 'task-101',
        tenantId: 'tenant-acme',
        projectId: 'proj-01',
        title: 'Implement Tenant Schema Isolation Middleware',
        assignee: 'Sai Teja',
        priority: 'URGENT',
        status: 'DONE',
        estimateHours: 16,
        loggedHours: 14
      },
      {
        id: 'task-102',
        tenantId: 'tenant-acme',
        projectId: 'proj-01',
        title: 'Benchmark Event Queue Throughput under 10k Concurrency',
        assignee: 'David Chen',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        estimateHours: 24,
        loggedHours: 18
      },
      {
        id: 'task-103',
        tenantId: 'tenant-acme',
        projectId: 'proj-02',
        title: 'Implement Multi-Tier Automated Approval State Machine',
        assignee: 'Sai Teja',
        priority: 'HIGH',
        status: 'REVIEW',
        estimateHours: 20,
        loggedHours: 20
      },
      {
        id: 'task-104',
        tenantId: 'tenant-acme',
        projectId: 'proj-03',
        title: 'Export SVG Icon & Component Tokens to Tailwind Presets',
        assignee: 'Elena Rostova',
        priority: 'MEDIUM',
        status: 'TODO',
        estimateHours: 12,
        loggedHours: 0
      }
    ];

    this.leads = [
      {
        id: 'lead-01',
        tenantId: 'tenant-acme',
        company: 'Vanguard Aerospace Corp',
        contactName: 'General Robert Hayes',
        email: 'r.hayes@vanguard-aero.com',
        dealValue: 180000,
        stage: 'NEGOTIATION',
        probability: 85,
        source: 'Enterprise RFP',
        notes: 'Requested on-prem air-gapped deployment option and SOC2 Type II cert.'
      },
      {
        id: 'lead-02',
        tenantId: 'tenant-acme',
        company: 'CyberCloud Networks',
        contactName: 'Amara Okafor',
        email: 'amara@cybercloud.io',
        dealValue: 75000,
        stage: 'PROPOSAL_SENT',
        probability: 60,
        source: 'Outbound Executive Sales',
        notes: 'Evaluating OmniFlow against legacy SAP SuccessFactors.'
      },
      {
        id: 'lead-03',
        tenantId: 'tenant-acme',
        company: 'Quantum Biotech Labs',
        contactName: 'Dr. Hiroshi Tanaka',
        email: 'tanaka@quantum-bio.jp',
        dealValue: 120000,
        stage: 'QUALIFIED',
        probability: 45,
        source: 'AI Summit 2026',
        notes: 'Interest in AI Workflow Automations for lab equipment scheduling.'
      }
    ];

    this.approvals = [
      {
        id: 'appr-001',
        tenantId: 'tenant-acme',
        type: 'CAPITAL_EXPENDITURE',
        requester: 'David Chen',
        requesterId: 'usr-103',
        department: 'Engineering',
        title: 'GPU Cluster Upgrade for Local LLM Serving (8x H100)',
        amount: 42000,
        urgency: 'HIGH',
        status: 'PENDING',
        currentStep: 'Executive Committee Review',
        createdAt: '2026-08-28T09:30:00Z',
        comments: 'Critical for offline model evaluation and privacy benchmark compliance.'
      },
      {
        id: 'appr-002',
        tenantId: 'tenant-acme',
        type: 'LEAVE_REQUEST',
        requester: 'Elena Rostova',
        requesterId: 'usr-104',
        department: 'Product Design',
        title: 'Annual Paid Time Off (PTO) - 10 Days',
        amount: 0,
        urgency: 'MEDIUM',
        status: 'APPROVED',
        currentStep: 'Completed',
        createdAt: '2026-08-25T14:10:00Z',
        comments: 'Covering design leads assigned to sprint items.'
      },
      {
        id: 'appr-003',
        tenantId: 'tenant-acme',
        type: 'VENDOR_CONTRACT',
        requester: 'Marcus Vance',
        requesterId: 'emp-005',
        department: 'Sales & Marketing',
        title: 'Global Dreamforce 2026 Platinum Sponsorship',
        amount: 85000,
        urgency: 'MEDIUM',
        status: 'PENDING',
        currentStep: 'Finance Department Approval',
        createdAt: '2026-08-30T11:00:00Z',
        comments: 'Expected qualified enterprise pipeline pipeline generation: $1.2M.'
      }
    ];

    this.auditLogs = [
      {
        id: 'audit-001',
        tenantId: 'tenant-acme',
        userId: 'usr-101',
        action: 'TENANT_CONFIG_UPDATED',
        resource: 'Security / Zero Trust Policy',
        details: 'Enforced hardware MFA key requirement for OrgAdmin & Manager roles.',
        timestamp: '2026-08-30T18:45:10Z',
        ipAddress: '10.0.4.12'
      },
      {
        id: 'audit-002',
        tenantId: 'tenant-acme',
        userId: 'usr-102',
        action: 'INVOICE_GENERATED',
        resource: 'INV-2026-003',
        details: 'Invoice generated for Nexus Health Systems ($56,160.00).',
        timestamp: '2026-08-30T16:20:00Z',
        ipAddress: '10.0.2.88'
      },
      {
        id: 'audit-003',
        tenantId: 'tenant-acme',
        userId: 'usr-101',
        action: 'WORKFLOW_APPROVED',
        resource: 'appr-002',
        details: 'Approved Leave Request for Elena Rostova.',
        timestamp: '2026-08-29T10:15:30Z',
        ipAddress: '10.0.4.12'
      }
    ];
  }

  logAudit(tenantId, userId, action, resource, details, ipAddress = '127.0.0.1') {
    const log = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      tenantId,
      userId: userId || 'SYSTEM',
      action,
      resource,
      details,
      timestamp: new Date().toISOString(),
      ipAddress
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

const db = new DatabaseStore();
module.exports = db;
