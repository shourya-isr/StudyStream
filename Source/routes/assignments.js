
import express from 'express';
import assignmentController from '../controllers/assignmentController.js';

const router = express.Router();

router.get('/', assignmentController.listAssignments); // supports filters/sorting
router.get('/overdue', assignmentController.listOverdueAssignments); // new: overdue
router.get('/:id', assignmentController.getAssignmentDetail); // supports ?includeTasks=true
router.post('/', assignmentController.createAssignment);
router.patch('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

export default router;
