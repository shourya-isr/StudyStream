// ScheduleVersion Controller
// Handles overview, restore, and version management endpoints
// Placeholder for future implementation
import db from '../db/init.js';

// GET /scheduleVersions?assignment_id=123
export async function getAllScheduleVersions(req, res) {
  const { assignment_id } = req.query;
  const where = assignment_id ? { assignment_id } : {};
  const versions = await db.ScheduleVersion.findAll({ where, order: [['version_number', 'ASC']] });
  res.json(versions);
}

// GET /scheduleVersions/:id
export async function getScheduleVersionById(req, res) {
  const { id } = req.params;
  const version = await db.ScheduleVersion.findByPk(id);
  if (!version) return res.status(404).json({ error: 'ScheduleVersion not found' });
  res.json(version);
}

// POST /scheduleVersions (manual creation, rarely used)
export async function createScheduleVersion(req, res) {
  const { assignment_id, cause, diff, warnings } = req.body;
  try {
    const created = await db.ScheduleVersion.create({ assignment_id, cause, diff, warnings });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PUT /scheduleVersions/:id (update version, rarely used)
export async function updateScheduleVersion(req, res) {
  const { id } = req.params;
  const data = req.body;
  const version = await db.ScheduleVersion.findByPk(id);
  if (!version) return res.status(404).json({ error: 'ScheduleVersion not found' });
  await version.update(data);
  res.json(version);
}

// DELETE /scheduleVersions/:id
export async function deleteScheduleVersion(req, res) {
  const { id } = req.params;
  const version = await db.ScheduleVersion.findByPk(id);
  if (!version) return res.status(404).json({ error: 'ScheduleVersion not found' });
  await version.destroy();
  res.json({ message: 'ScheduleVersion deleted' });
}

export default {
  getAllScheduleVersions,
  getScheduleVersionById,
  createScheduleVersion,
  updateScheduleVersion,
  deleteScheduleVersion
};
