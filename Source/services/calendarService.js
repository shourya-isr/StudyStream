// CalendarService: stub for calendar integration

import fs from 'fs';
import { icsToJson } from 'ics-to-json';

import db from '../models/index.js';

function taskToICS(tasks) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
  for (const task of tasks) {
    ics += 'BEGIN:VEVENT\n';
    if (task.title) ics += `SUMMARY:${task.title}\n`;
    if (task.description) ics += `DESCRIPTION:${task.description}\n`;
    if (task.status) ics += `X-STATUS:${task.status}\n`;
    if (task.priority) ics += `PRIORITY:${task.priority === 'high' ? 1 : task.priority === 'medium' ? 5 : 9}\n`;
    if (task.assignment_id) ics += `X-ASSIGNMENT-ID:${task.assignment_id}\n`;
    if (task.planned_start) ics += `DTSTART:${formatICSDate(task.planned_start)}\n`;
    if (task.planned_end) ics += `DTEND:${formatICSDate(task.planned_end)}\n`;
    ics += 'END:VEVENT\n';
  }
  ics += 'END:VCALENDAR\n';
  return ics;
}

function formatICSDate(date) {
  // Format as YYYYMMDDTHHmmssZ
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z').replace('T', 'T');
}

export default {
  async getAvailability(studentId) {
    // Read sample.ics from calendar folder
    const icsPath = new URL('../calendar/sample.ics', import.meta.url).pathname;
    const icsData = fs.readFileSync(icsPath, 'utf-8');
    // Convert ICS to JSON
    let calendarJson;
    try {
      calendarJson = icsToJson(icsData);
    } catch (e) {
      calendarJson = null;
    }
    // Extract unavailable slots (blocked slots and events)
    let unavailableSlots = [];
    if (calendarJson && Array.isArray(calendarJson.events) && calendarJson.events.length > 0) {
      for (const event of calendarJson.events) {
        if (event.start && event.end) {
          unavailableSlots.push({
            start: event.start,
            end: event.end,
            summary: event.summary || ''
          });
        }
      }
    } else {
      // Fallback: manual ICS parsing for VEVENT blocks
      const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
      const dtstartRegex = /DTSTART[^:]*:(.*)/;
      const dtendRegex = /DTEND[^:]*:(.*)/;
      const summaryRegex = /SUMMARY:(.*)/;
      let match;
      while ((match = eventRegex.exec(icsData)) !== null) {
        const block = match[1];
        const startMatch = dtstartRegex.exec(block);
        const endMatch = dtendRegex.exec(block);
        const summaryMatch = summaryRegex.exec(block);
        if (startMatch && endMatch) {
          unavailableSlots.push({
            start: startMatch[1].trim(),
            end: endMatch[1].trim(),
            summary: summaryMatch ? summaryMatch[1].trim() : ''
          });
        }
      }
    }
    return unavailableSlots;
  },

  async exportTasksToICS(studentId) {
  // Fetch all tasks for the student
  const assignments = await db.Assignment.findAll({ where: { student_id: studentId } });
  const assignmentIds = assignments.map(a => a.id);
  const tasks = await db.Task.findAll({ where: { assignment_id: assignmentIds } });
  const icsString = taskToICS(tasks);
  // Save to calendar folder with timestamp
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*$/, '');
  const filePath = `calendar/sample_${timestamp}.ics`;
  fs.writeFileSync(filePath, icsString, 'utf-8');
  return filePath;
  }
};
