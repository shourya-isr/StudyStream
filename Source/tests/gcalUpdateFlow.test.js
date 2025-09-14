import db from '../models/index.js';
import assignmentService from '../services/assignmentService.js';

// Ensure global.oauth2Client is available for Google Calendar sync
import dotenv from 'dotenv';
dotenv.config();
beforeAll(async () => {
  if (!global.oauth2Client) {
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
      global.oauth2Client = oauth2Client;
    }
  }
});

describe('Google Calendar Assignment Update Flow', () => {
  let assignment;
  let initialTasks;

  beforeAll(async () => {
    // Fetch the existing assignment with id 19
    assignment = await db.Assignment.findByPk(19);
    // Fetch its tasks
    initialTasks = await db.Task.findAll({ where: { assignment_id: 19 } });
  }, 60000);

  it('marks first task as completed and updates due date', async () => {
    // Mark first task as completed
    await db.Task.update({ status: 'completed' }, { where: { id: initialTasks[0].id } });

    // Update due date to 16 September 2025
    const newDueDate = '2025-09-16T23:59:00.000Z';
    const result = await assignmentService.updateAssignment(19, { due_date: newDueDate });

    // Validate due date update
    expect(new Date(result.updatedAssignment.due_date).toISOString()).toBe(newDueDate);
    expect(Array.isArray(result.updatedTasks)).toBe(true);
    expect(result.updatedTasks.length).toBeGreaterThanOrEqual(1);
    expect(result.warnings).toBeDefined();

    // Log and assert Google Calendar events
    console.log('Updated Google Calendar events:', JSON.stringify(result.gcalEvents, null, 2));
    expect(Array.isArray(result.gcalEvents)).toBe(true);
    expect(result.gcalEvents.length).toBeGreaterThanOrEqual(1);

    // Validate new active tasks
    const activeTasks = await db.Task.findAll({ where: { assignment_id: 19, status: 'active' } });
    expect(activeTasks.length).toBeGreaterThanOrEqual(1);
    activeTasks.forEach(task => {
      expect(task.status).toBe('active');
      expect(task.planned_end).toBeTruthy();
    });
  }, 60000);
});
