// Telemetry Service: Handles work session logic and triggers adaptive scheduling
import db from '../models/index.js';
import AssignmentService from './assignmentService.js';

export default {
  async startSession(taskId, studentId, notes = '') {
    // Create a new work session with start_time
    const now = new Date();
    const session = await db.WorkSession.create({
      task_id: taskId,
      student_id: studentId,
      start_time: now,
      notes
    });
    return session;
  },
  async endSession(sessionId, notes = '') {
    // End a work session, record end_time and duration
    const session = await db.WorkSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.end_time) throw new Error('Session already ended');
    const now = new Date();
    session.end_time = now;
    session.duration = Math.round((now - session.start_time) / 1000); // duration in seconds
    if (notes) session.notes = notes;
    await session.save();
    // Trigger assignment/task completion logic
    await AssignmentService.notifyTaskComplete(session.task_id, session.duration);
    return session;
  },
  async pauseSession(sessionId, notes = '') {
    // Pause a work session (only if started and not ended/paused)
    const session = await db.WorkSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.end_time) throw new Error('Session already ended');
    if (session.notes && session.notes.includes('paused')) throw new Error('Session already paused');
    session.notes = (session.notes ? session.notes + '\n' : '') + 'paused';
    await session.save();
    // Trigger assignment/task paused logic
    await AssignmentService.notifyTaskPaused(session.task_id, Math.round((new Date() - session.start_time) / 1000));
    return session;
  },
  async getActiveSession(taskId, studentId) {
    // Find active session for a task/student
    return await db.WorkSession.findOne({
      where: {
        task_id: taskId,
        student_id: studentId,
        end_time: null
      }
    });
  }
};