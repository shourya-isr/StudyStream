import db from '../db/init.js';
const { Assignment, Task } = db;

// GET /assignments
export async function listAssignments(req, res) {
  const { status, course, dueFrom, dueTo, priority, sortBy = 'due_date', sortOrder = 'ASC' } = req.query;
  const where = {};
  if (status) where.status = status;
  if (course) where.course = course;
  if (priority) where.priority = priority;
  if (dueFrom || dueTo) {
    where.due_date = {};
      if (dueFrom) where.due_date['$gte'] = dueFrom;
      if (dueTo) where.due_date['$lte'] = dueTo;
  }
  const assignments = await Assignment.findAll({ where, order: [[sortBy, sortOrder]] });
  // Add computed status and lightweight task counts
  const today = new Date();
  const result = await Promise.all(assignments.map(async (a) => {
    const tasks = await Task.findAll({ where: { assignment_id: a.id } });
    const activeCount = tasks.filter(t => t.status === 'active').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const overdueCount = tasks.filter(t => t.status === 'active' && t.planned_end && new Date(t.planned_end) < today).length;
    // On-track/behind: behind if any overdue active task or due_date < today and not completed
    let computedStatus = 'on-track';
    if (a.status !== 'completed' && (a.due_date < today || overdueCount > 0)) computedStatus = 'behind';
    return {
      ...a.toJSON(),
      activeTaskCount: activeCount,
      completedTaskCount: completedCount,
      overdueTaskCount: overdueCount,
      computedStatus
    };
  }));
  res.json(result);
}

// GET /assignments/overdue
export async function listOverdueAssignments(req, res) {
  const today = new Date();
  const assignments = await Assignment.findAll({
    where: {
      due_date: { $lt: today },
      status: { $notIn: ['completed', 'cancelled', 'deleted'] }
    },
    order: [['due_date', 'ASC']]
  });
  res.json(assignments);
}

// GET /assignments/:id
export async function getAssignmentDetail(req, res) {
  const { id } = req.params;
  const { includeTasks } = req.query;
  const assignment = await Assignment.findByPk(id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (includeTasks === 'true') {
    const tasks = await Task.findAll({ where: { assignment_id: id } });
    const plannedTasks = tasks.filter(t => t.status === 'active');
    const actualTasks = tasks.filter(t => t.status === 'completed');
    // Remaining effort: sum durations of incomplete tasks
    const remainingEffort = plannedTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    // Risk: remaining effort > time left, or any overdue planned task
    const today = new Date();
    const timeLeft = Math.max(0, Math.floor((new Date(assignment.due_date) - today) / (1000 * 60 * 60)));
    const hasOverdue = plannedTasks.some(t => t.planned_end && new Date(t.planned_end) < today);
    let risk = 'low';
    if (remainingEffort > timeLeft || hasOverdue) risk = 'high';
    res.json({
      ...assignment.toJSON(),
      plannedTasks,
      actualTasks,
      remainingEffort,
      risk
    });
  } else {
    res.json(assignment);
  }
}

// POST /assignments
export async function createAssignment(req, res) {
  try {
  const AssignmentService = (await import('../services/assignmentService.js')).default;
    const { student_id, title, description, course, due_date, priority, estimatedhours, complexity, status } = req.body;
  const media = req.file ? req.file.path : req.body.media; // should be absolute file path

    // Step 1: Create assignment and save file path
    const assignment = await AssignmentService.createAssignment({
      student_id, title, description, course, due_date, priority, estimatedhours, complexity, status, media
    });

    // Step 2: Analyze file for task plans
    const taskPlans = await AssignmentService.analyzeMediaForTasks(assignment);

    // Step 3: Schedule tasks with calendar
    const scheduledTasks = await AssignmentService.scheduleTasksWithCalendar(assignment, taskPlans);

    // Step 4: Update assignment with scheduled tasks
    await AssignmentService.updateAssignmentWithTasks(assignment.id, scheduledTasks);

    res.status(201).json({ assignment, scheduledTasks });
  } catch (err) {
    console.error('Assignment creation error:', err);
    res.status(400).json({ error: err.message, details: err });
  }
}

// PATCH /assignments/:id
export async function updateAssignment(req, res) {
  const { id } = req.params;
  const data = req.body;
  const AssignmentService = (await import('../services/assignmentService.js')).default;
  try {
    const result = await AssignmentService.updateAssignment(id, data);
    res.json(result);
  } catch (err) {
    console.error('Assignment update error:', err);
    res.status(400).json({ error: err.message, details: err });
  }
}

// DELETE /assignments/:id
export async function deleteAssignment(req, res) {
  const { id } = req.params;
  const assignment = await Assignment.findByPk(id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  // Soft delete if sessions exist, else hard delete
  if (assignment.status !== 'deleted') {
    await assignment.update({ status: 'cancelled' });
    res.json({ message: 'Assignment cancelled (soft delete)' });
  } else {
    await assignment.destroy();
    res.json({ message: 'Assignment deleted' });
  }
}

export default {
  listAssignments,
  listOverdueAssignments,
  getAssignmentDetail,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
