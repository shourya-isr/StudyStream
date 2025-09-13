

import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'studystream_secret', resave: false, saveUninitialized: true }));

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);

// Route: Start Google OAuth2 flow
app.get('/auth/google', (req, res) => {
	const scopes = ['https://www.googleapis.com/auth/calendar'];
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
	});
	res.redirect(url);
});

// Route: Google OAuth2 callback
app.get('/auth/google/callback', async (req, res) => {
	const { code } = req.query;
	try {
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);
		req.session.tokens = tokens;
		res.send('Google Calendar connected!');
	} catch (err) {
		res.status(500).send('OAuth error: ' + err.message);
	}
});

// Example: List calendar events for authenticated user
app.get('/calendar/events', async (req, res) => {
		if (!req.session.tokens) return res.status(401).send('Not authenticated with Google');
		oauth2Client.setCredentials(req.session.tokens);
		const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
		try {
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
			res.json(result.data.items);
		} catch (err) {
			res.status(500).send('Calendar API error: ' + err.message);
		}
});

// Mount API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
