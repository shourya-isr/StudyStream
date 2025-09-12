import express from 'express';
import scheduleVersionController from '../controllers/scheduleVersionController.js';

const router = express.Router();

router.get('/', scheduleVersionController.getAllScheduleVersions);
router.get('/:id', scheduleVersionController.getScheduleVersionById);
router.post('/', scheduleVersionController.createScheduleVersion);
router.put('/:id', scheduleVersionController.updateScheduleVersion);
router.delete('/:id', scheduleVersionController.deleteScheduleVersion);

export default router;
