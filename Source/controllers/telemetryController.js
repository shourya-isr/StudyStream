// Telemetry Controller: API endpoints for work session management
import TelemetryService from '../services/telemetryService.js';

export async function startSession(req, res) {
  const { taskId } = req.params;
  const { student_id, notes } = req.body;
  try {
    const session = await TelemetryService.startSession(taskId, student_id, notes);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function endSession(req, res) {
  const { sessionId } = req.params;
  const { notes } = req.body;
  try {
    const session = await TelemetryService.endSession(sessionId, notes);
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function pauseSession(req, res) {
  const { sessionId } = req.params;
  const { notes } = req.body;
  try {
    const session = await TelemetryService.pauseSession(sessionId, notes);
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export default {
  startSession,
  endSession,
  pauseSession
};