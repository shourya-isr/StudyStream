
import express from 'express';
import assignments from './assignments.js';
import tasks from './tasks.js';
import scheduler from './scheduler.js';
import scheduleVersions from './scheduleVersions.js';

const router = express.Router();

// Example route placeholder
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to StudyStream API' });
});

// Assignment routes
router.use('/assignments', assignments);

// Task routes
router.use('/tasks', tasks);

// Scheduler Service routes
router.use('/scheduler', scheduler);

// ScheduleVersion routes
router.use('/scheduleVersions', scheduleVersions);
// Telemetry routes
router.use('/telemetry', telemetry);

export default router;
