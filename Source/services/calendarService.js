// CalendarService: stub for calendar integration

import fs from 'fs';
import { icsToJson } from 'ics-to-json';

export default {
  async getAvailability(studentId) {
    // Read sample.ics from calendar folder
    const icsPath = new URL('../calendar/sample.ics', import.meta.url).pathname;
    const icsData = fs.readFileSync(icsPath, 'utf-8');
    // Convert ICS to JSON
    const calendarJson = icsToJson(icsData);
    return calendarJson;
  }
};
