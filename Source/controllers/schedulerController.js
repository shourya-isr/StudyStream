
import db from '../db/init.js';
import { google } from 'googleapis';
import schedulerService from '../services/schedulerService.js';
const { Assignment, Task, ScheduleVersion } = db;

// GET /schedule/overview
export async function getScheduleOverview(req, res) {
  // Use Google OAuth2 client from session tokens if available
  let oauth2Client = null;
  if (req.session && req.session.tokens) {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(req.session.tokens);
  }
  const today = new Date();
  const assignments = await Assignment.findAll({ where: { status: { $notIn: ['completed', 'cancelled', 'deleted'] } } });
  const tasks = await Task.findAll({ where: { status: { $notIn: ['completed', 'deleted'] } } });
  // Optionally, you can use schedulerService.schedule here for advanced overview with calendar integration
  // For now, just pass oauth2Client to future calls as needed
  // ...existing code for timeline, capacity, risks, nextActions...
  const timeline = tasks.map(t => ({
    id: t.id,
    assignment_id: t.assignment_id,
    title: t.title,
    planned_start: t.planned_start,
    planned_end: t.planned_end,
    status: t.status
  })).sort((a, b) => new Date(a.planned_start) - new Date(b.planned_start));
  const capacity = {};
  for (let i = 0; i < 7; i++) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dayStr = day.toISOString().slice(0, 10);
    capacity[dayStr] = tasks.filter(t => t.planned_start && new Date(t.planned_start).toISOString().slice(0, 10) === dayStr).length;
  }
  const risks = assignments.filter(a => {
    const aTasks = tasks.filter(t => t.assignment_id === a.id);
    const overdue = aTasks.some(t => t.planned_end && new Date(t.planned_end) < today && t.status === 'active');
    const remainingEffort = aTasks.filter(t => t.status === 'active').reduce((sum, t) => sum + (t.duration || 0), 0);
    const timeLeft = Math.max(0, Math.floor((new Date(a.due_date) - today) / (1000 * 60 * 60)));
    return overdue || remainingEffort > timeLeft;
  }).map(a => ({ id: a.id, title: a.title, due_date: a.due_date }));
  const nextActions = tasks.filter(t => {
    const start = t.planned_start ? new Date(t.planned_start) : null;
    return (start && start >= today && start <= new Date(today.getTime() + 48 * 60 * 60 * 1000)) || (t.planned_end && new Date(t.planned_end) < today && t.status === 'active');
  }).map(t => ({ id: t.id, title: t.title, planned_start: t.planned_start, planned_end: t.planned_end, status: t.status }));
  res.json({ timeline, capacity, risks, nextActions });
}

export default {
  getScheduleOverview
};
