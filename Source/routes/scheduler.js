import express from 'express';
import schedulerController from '../controllers/schedulerController.js';

const router = express.Router();

router.get('/overview', schedulerController.getScheduleOverview); // new: dashboard
router.post('/plan', schedulerController.planSchedule);
router.post('/replan', schedulerController.replanSchedule);

export default router;
