import { describe, it, expect, beforeAll } from '@jest/globals';
import assignmentService from '../services/assignmentService.js';
import { google } from 'googleapis';
import db from '../models/index.js';

// Ensure global.oauth2Client is available for Google Calendar sync
import dotenv from 'dotenv';
dotenv.config();
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


const TEST_ASSIGNMENT = {
  student_id: 3,
  title: 'Homework',
  description: 'Test full workflow with GCal',
  course: '123',
  due_date: '2025-09-17',
  priority: 'low',
  media: '/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/Maths Test.pdf',
  status: 'active',
  rationale: ''
};

describe('AssignmentService Full Flow with Google Calendar', () => {
  beforeAll(async () => {
    // Clean database tables before testing
    await db.WorkSession.destroy({ where: {}, truncate: true, force: true });
    await db.Task.destroy({ where: {}, truncate: true, force: true });
    await db.ScheduleVersion.destroy({ where: {}, truncate: true, force: true });
    await db.Assignment.destroy({ where: {}, truncate: true, force: true });
  });

  it('should run the full assignment workflow and sync with Google Calendar', async () => {
    // Step 1: Create assignment
    const assignment = await assignmentService.createAssignment(TEST_ASSIGNMENT);
    expect(assignment).toHaveProperty('id');
    // Step 2: Analyze media for tasks
    const scrubbedTaskPlans = await assignmentService.analyzeMediaForTasks(assignment);
    expect(Array.isArray(scrubbedTaskPlans)).toBe(true);
    expect(scrubbedTaskPlans.length).toBeGreaterThan(0);
    // Step 3: Schedule tasks with calendar
    const scheduled = await assignmentService.scheduleTasksWithCalendar(assignment, scrubbedTaskPlans);
    expect(scheduled).toHaveProperty('scheduledTasks');
    expect(Array.isArray(scheduled.scheduledTasks)).toBe(true);
    expect(scheduled.scheduledTasks.length).toBeGreaterThan(0);

    // Step 4: Sync tasks to Google Calendar using assignmentService
    // Expect oauth2Client to be provided by app context or test setup
    const oauth2Client = global.oauth2Client || null;
    if (!oauth2Client) {
      console.warn('No oauth2Client available in test context. Skipping Google Calendar sync test.');
      return;
    }
    const createdEvents = await assignmentService.syncAssignmentTasksToGoogleCalendar(assignment, oauth2Client);
    expect(Array.isArray(createdEvents)).toBe(true);
    expect(createdEvents.length).toBeGreaterThan(0);
    console.log('Created Google Calendar events:', JSON.stringify(createdEvents, null, 2));
  }, 180000);
});
