/**
 * Projects, Sprints & Kanban Tasks Controller
 */

const db = require('../config/database');
const { auditLog } = require('../middleware/auditLogger');

const projectController = {
  getProjects: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const projects = db.projects.filter(p => p.tenantId === tenantId);
    return { status: 200, data: projects };
  },

  getTasks: (req) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const tasks = db.tasks.filter(t => t.tenantId === tenantId);
    return { status: 200, data: tasks };
  },

  createProject: (req, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const { title, description, department, priority, lead, budget, deadline } = body || {};

    if (!title) {
      return { status: 400, data: { error: 'Project title is required' } };
    }

    const newProject = {
      id: `proj-${String(db.projects.length + 1).padStart(2, '0')}`,
      tenantId,
      title,
      description: description || 'Enterprise strategic initiative.',
      department: department || 'Engineering',
      progress: 0,
      priority: priority || 'MEDIUM',
      status: 'ACTIVE',
      lead: lead || (req.user ? req.user.name : 'Unassigned'),
      budget: Number(budget) || 50000,
      deadline: deadline || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
    };

    db.projects.push(newProject);
    auditLog(req, 'PROJECT_CREATED', newProject.id, `Created initiative: ${newProject.title}`);

    return { status: 201, data: { message: 'Project initialized', project: newProject } };
  },

  createTask: (req, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const { projectId, title, assignee, priority, estimateHours } = body || {};

    if (!title) {
      return { status: 400, data: { error: 'Task title is required' } };
    }

    const newTask = {
      id: `task-${Date.now().toString().slice(-4)}`,
      tenantId,
      projectId: projectId || (db.projects[0] ? db.projects[0].id : 'proj-01'),
      title,
      assignee: assignee || 'Sai Teja',
      priority: priority || 'HIGH',
      status: 'TODO',
      estimateHours: Number(estimateHours) || 8,
      loggedHours: 0
    };

    db.tasks.push(newTask);
    auditLog(req, 'TASK_CREATED', newTask.id, `Created task: ${newTask.title}`);

    return { status: 201, data: { message: 'Task created', task: newTask } };
  },

  updateTaskStatus: (req, id, body) => {
    const tenantId = req.tenantId || 'tenant-acme';
    const task = db.tasks.find(t => t.id === id && t.tenantId === tenantId);

    if (!task) {
      return { status: 404, data: { error: 'Task not found' } };
    }

    const { status } = body || {};
    task.status = status || task.status;

    auditLog(req, 'TASK_STATUS_UPDATED', task.id, `Moved task to ${task.status}`);

    return { status: 200, data: { message: 'Task updated', task } };
  }
};

module.exports = projectController;
