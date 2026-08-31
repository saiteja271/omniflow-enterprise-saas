/**
 * HRMS & Payroll Controller
 */

const db = require('../config/database');
const { auditLog } = require('../middleware/auditLogger');

const hrmsController = {
  getEmployees: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const employees = db.employees.filter(e => e.tenantId === tenantId);
    return { status: 200, data: employees };
  },

  getDepartments: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const departments = db.departments.filter(d => d.tenantId === tenantId);
    return { status: 200, data: departments };
  },

  createEmployee: (req, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const { fullName, designation, department, email, salary } = body || {};

    if (!fullName || !email || !department) {
      return { status: 400, data: { error: 'Full name, email, and department are required' } };
    }

    const newEmp = {
      id: `emp-${String(db.employees.length + 1).padStart(3, '0')}`,
      tenantId,
      userId: `usr-${Date.now().toString().slice(-4)}`,
      fullName,
      designation: designation || 'Specialist',
      department,
      email,
      salary: Number(salary) || 85000,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      performanceScore: 90
    };

    db.employees.push(newEmp);
    auditLog(req, 'EMPLOYEE_CREATED', newEmp.id, `Added employee ${newEmp.fullName} (${newEmp.department})`);

    return { status: 201, data: { message: 'Employee added successfully', employee: newEmp } };
  },

  runPayroll: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const employees = db.employees.filter(e => e.tenantId === tenantId && e.status === 'ACTIVE');
    
    const totalPayroll = employees.reduce((sum, e) => sum + (e.salary / 12), 0);
    const payrollRunId = `PAY-${Date.now().toString().slice(-6)}`;

    auditLog(req, 'PAYROLL_PROCESSED', payrollRunId, `Processed monthly payroll for ${employees.length} employees ($${totalPayroll.toFixed(2)})`);

    return {
      status: 200,
      data: {
        payrollRunId,
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        employeeCount: employees.length,
        totalDisbursed: Math.round(totalPayroll * 100) / 100,
        status: 'DISBURSED',
        timestamp: new Date().toISOString()
      }
    };
  }
};

module.exports = hrmsController;
