import { describe, it, expect, beforeAll } from '@jest/globals';
import assignmentService from '../services/assignmentService.js';
import db from '../models/index.js';

const TEST_ASSIGNMENT = {
  student_id: 1,
  title: 'Full Flow Assignment',
  description: 'Test full workflow',
  course: 'Math 101',
  due_date: '2025-09-18',
  priority: 'high',
  media: '/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/Maths Test.pdf',
  estimatedhours: 20,
  complexity: 'hard',
  status: 'active'
};

describe('AssignmentService Full Flow', () => {
  beforeAll(async () => {
    // Clean database tables before testing
    await db.WorkSession.destroy({ where: {}, truncate: true, force: true });
    await db.Task.destroy({ where: {}, truncate: true, force: true });
    await db.ScheduleVersion.destroy({ where: {}, truncate: true, force: true });
    await db.Assignment.destroy({ where: {}, truncate: true, force: true });
  });

    it('should run the full assignment workflow', async () => {
      // Step 1: Create assignment
      const assignment = await assignmentService.createAssignment(TEST_ASSIGNMENT);
      expect(assignment).toHaveProperty('id');
      // Step 2: Analyze media for tasks
      const scrubbedTaskPlans = await assignmentService.analyzeMediaForTasks(assignment);
      expect(Array.isArray(scrubbedTaskPlans)).toBe(true);
      expect(scrubbedTaskPlans.length).toBeGreaterThan(0);
      // Step 3: Schedule tasks with calendar
      const scheduled = await assignmentService.scheduleTasksWithCalendar(assignment, scrubbedTaskPlans);
      expect(scheduled).toHaveProperty('scheduledTasks');
      expect(Array.isArray(scheduled.scheduledTasks)).toBe(true);
      expect(scheduled.scheduledTasks.length).toBeGreaterThan(0);
      expect(scheduled.scheduledTasks[0]).toHaveProperty('title');
      expect(scheduled.scheduledTasks[0]).toHaveProperty('duration');
      expect(scheduled.scheduledTasks[0]).toHaveProperty('planned_start');
      expect(scheduled.scheduledTasks[0]).toHaveProperty('planned_end');
      // Step 4: Print output for debug
      console.log('Full workflow scheduled tasks:', JSON.stringify(scheduled.scheduledTasks, null, 2));
      if (scheduled.warnings && scheduled.warnings.length > 0) {
        console.log('Full workflow warnings:', scheduled.warnings);
      }
    }, 45000);
});
