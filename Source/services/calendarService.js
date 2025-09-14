// CalendarService: stub for calendar integration


import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();



const calendarService = {
  async getAvailability(studentId, oauth2Client, { timeMin, timeMax } = {}) {
    // Use real credentials from .env if no oauth2Client is provided (for test environments)
    if (!oauth2Client) {
      oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    }
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // Default: today
    if (!timeMin || !timeMax) {
      const today = new Date();
      timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    }
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    // Return unavailable slots (start, end, summary)
    return result.data.items.map(event => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      summary: event.summary || ''
    }));
  },

  async exportTasksToGoogleCalendar(studentId, oauth2Client) {
    // Fetch all tasks for the student
    const db = (await import('../models/index.js')).default;
    const assignments = await db.Assignment.findAll({ where: { student_id: studentId } });
    const assignmentIds = assignments.map(a => a.id);
    const tasks = await db.Task.findAll({ where: { assignment_id: assignmentIds } });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // Create events for each task
    // assignment_id is always saved in extendedProperties.private for each event
    const createdEvents = [];
    for (const task of tasks) {
      const eventData = {
        summary: task.title,
        description: task.description || '',
        start: { dateTime: task.planned_start ? new Date(task.planned_start).toISOString() : undefined },
        end: { dateTime: task.planned_end ? new Date(task.planned_end).toISOString() : undefined },
        extendedProperties: {
          private: {
            assignment_id: task.assignment_id, // always present for safe deletion
            status: task.status,
            priority: task.priority,
            task_id: task.id
          }
        }
      };
      const result = await calendar.events.insert({ calendarId: 'primary', resource: eventData });
      createdEvents.push(result.data);
    }
    return createdEvents;
  },

  async deleteTaskEventsFromGoogleCalendar(studentId, taskOrAssignment, oauth2Client) {
    // Accept assignment object for deletion
    let assignmentId = null;
    if (taskOrAssignment && typeof taskOrAssignment === 'object' && 'id' in taskOrAssignment) {
      assignmentId = taskOrAssignment.id;
    } else if (typeof taskOrAssignment === 'number') {
      assignmentId = taskOrAssignment;
    }
    console.log('Deleting events for assignmentId:', assignmentId);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = result.data.items || [];
    // Find events with matching assignment_id in extendedProperties.private
    const toDelete = events.filter(event => {
      const ext = event.extendedProperties && event.extendedProperties.private;
      return ext && ext.assignment_id && assignmentId && String(ext.assignment_id) === String(assignmentId);
    });
    for (const event of toDelete) {
      await calendar.events.delete({ calendarId: 'primary', eventId: event.id });
    }
    return toDelete.map(e => e.id);
  }
};

export default calendarService;
