
import db from '../models/index.js';
import AssignmentService from '../services/assignmentService.js';
import SchedulerService from '../services/schedulerService.js';

describe('Assignment Update/Replan Flow', () => {
  let assignment;
  let initialTasks;

  beforeAll(async () => {
    // Clean DB
    await db.WorkSession.truncate({ cascade: true });
    await db.Task.truncate({ cascade: true });
    await db.ScheduleVersion.truncate({ cascade: true });
    await db.Assignment.truncate({ cascade: true });

    // Create assignment using normal flow
    assignment = await AssignmentService.createAssignment({
      student_id: 3,
      title: 'Test Assignment v2',
      description: 'Initial assignment',
      course: 'Math',
      due_date: '2025-09-17T23:59:00.000Z',
      priority: 'low',
      media: '/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/Maths Test.pdf',
      rationale: '',
      status: 'active'
    });

    // Analyze media and schedule tasks using the normal creation logic
    const scrubbedTaskPlans = await AssignmentService.analyzeMediaForTasks(assignment);
    const scheduleResult = await AssignmentService.scheduleTasksWithCalendar(assignment, scrubbedTaskPlans);
    initialTasks = scheduleResult.dbTasks;
  }, 60000);

//   it('marks one task as completed and triggers replan on due_date change', async () => {
//     // Mark Task 1 as completed
//     await db.Task.update({ status: 'completed' }, { where: { id: initialTasks[0].id } });

//     // Change due_date to one day later
//     const newDueDate = '2025-09-16T23:59:00.000Z';
//     const result = await AssignmentService.updateAssignment(assignment.id, { due_date: newDueDate });

//     // Ensure due_date is compared as string
//     expect(new Date(result.updatedAssignment.due_date).toISOString()).toBe(newDueDate);
//     expect(Array.isArray(result.updatedTasks)).toBe(true);
//     expect(result.updatedTasks.length).toBeGreaterThanOrEqual(1);
//     expect(result.warnings).toBeDefined();

//     // Check that only active tasks were updated
//     const updatedTask = await db.Task.findByPk(initialTasks[1].id);
//     expect(updatedTask.status).toBe('active');
//     expect(updatedTask.planned_end).toBeTruthy();
//   }, 60000);

  it('triggers replan on priority change', async () => {
    // Change priority
    const result = await AssignmentService.updateAssignment(assignment.id, { priority: 'high' });
    expect(result.updatedAssignment.priority).toBe('high');
    expect(Array.isArray(result.updatedTasks)).toBe(true);
    expect(result.updatedTasks.length).toBeGreaterThanOrEqual(1);
    expect(result.warnings).toBeDefined();
  }, 60000);

  it('does NOT trigger replan on title change', async () => {
    // Change title only
    const result = await AssignmentService.updateAssignment(assignment.id, { title: 'Updated Title' });
    expect(result.updatedAssignment.title).toBe('Updated Title');
    expect(result.updatedTasks.length).toBe(0);
    expect(result.warnings.length).toBe(0);
  }, 60000);

  it('records schedule version only when replan occurs', async () => {
    // There should be at least two schedule versions (from previous replans)
    const versions = await db.ScheduleVersion.findAll({ where: { assignment_id: assignment.id } });
    expect(versions.length).toBeGreaterThanOrEqual(2);
    // Changing a non-critical field should not add a new version
    await AssignmentService.updateAssignment(assignment.id, { course: 'Physics' });
    const versionsAfter = await db.ScheduleVersion.findAll({ where: { assignment_id: assignment.id } });
    expect(versionsAfter.length).toBe(versions.length);
  }, 60000);
});
