// CalendarService: stub for calendar integration
export default {
  async getAvailability(studentId) {
    // TODO: Integrate with calendar API
    // Return array of available time slots
    return [
      { start: '2025-09-25T09:00:00Z', end: '2025-09-25T14:00:00Z' },
      { start: '2025-09-26T10:00:00Z', end: '2025-09-26T12:00:00Z' }
    ];
  }
};
