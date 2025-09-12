
import express from 'express';
import assignmentController from '../controllers/assignmentController.js';

const router = express.Router();

router.get('/', assignmentController.listAssignments);
router.get('/:id', assignmentController.getAssignmentDetail);
router.post('/', assignmentController.createAssignment);
router.patch('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

export default router;
