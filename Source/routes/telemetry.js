// Telemetry API routes
import express from 'express';
import telemetryController from '../controllers/telemetryController.js';

const router = express.Router();

// Start a work session for a task
router.post('/tasks/:taskId/sessions/start', telemetryController.startSession);
// End a work session
router.post('/sessions/:sessionId/end', telemetryController.endSession);
// Pause a work session
router.post('/sessions/:sessionId/pause', telemetryController.pauseSession);

export default router;
