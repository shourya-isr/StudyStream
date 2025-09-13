import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

describe('Google Calendar direct API integration', () => {
  it("should list today's calendar events using googleapis", async () => {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // Get today's date range in RFC3339 format
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = result.data.items;
    console.log('Google Calendar events for today:', JSON.stringify(events, null, 2));
    expect(Array.isArray(events)).toBe(true);
  });
});
