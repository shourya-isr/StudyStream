import db from '../db/init.js';
const { Task } = db;

// GET /tasks
export async function listTasks(req, res) {
  const { assignment_id, status, priority } = req.query;
  const where = {};
  if (assignment_id) where.assignment_id = assignment_id;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  const tasks = await Task.findAll({ where });
  res.json(tasks);
}

// GET /tasks/:id
export async function getTaskDetail(req, res) {
  const { id } = req.params;
  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}

// POST /tasks
export async function createTask(req, res) {
  try {
    const data = req.body;
    const task = await Task.create(data);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PATCH /tasks/:id
export async function updateTask(req, res) {
  const { id } = req.params;
  const data = req.body;
  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  await task.update(data);
  res.json(task);
}

// DELETE /tasks/:id
export async function deleteTask(req, res) {
  const { id } = req.params;
  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  await task.destroy();
  res.json({ message: 'Task deleted' });
}

export default {
  listTasks,
  getTaskDetail,
  createTask,
  updateTask,
  deleteTask
};
