// CalendarService: stub for calendar integration

import fs from 'fs';
import { icsToJson } from 'ics-to-json';

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
  }
};
