import db from '../db/init.js';
const { Assignment } = db;

// GET /assignments
export async function listAssignments(req, res) {
  const { status, course, dueFrom, dueTo, priority } = req.query;
  const where = {};
  if (status) where.status = status;
  if (course) where.course = course;
  if (priority) where.priority = priority;
  if (dueFrom || dueTo) {
    where.due_date = {};
    if (dueFrom) where.due_date['$gte'] = new Date(dueFrom);
    if (dueTo) where.due_date['$lte'] = new Date(dueTo);
  }
  const assignments = await Assignment.findAll({ where });
  res.json(assignments);
}

// GET /assignments/:id
export async function getAssignmentDetail(req, res) {
  const { id } = req.params;
  const assignment = await Assignment.findByPk(id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json(assignment);
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
  const assignment = await Assignment.findByPk(id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  await assignment.update(data);
  res.json(assignment);
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
  getAssignmentDetail,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
