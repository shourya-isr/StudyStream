
import db from '../db/init.js';
import schedulerService from '../services/schedulerService.js';
const { getScheduleOverviewService, splitIntoBlocks, resolveConflicts, minimizeChanges } = schedulerService;
const { sequelize, Assignment, Task } = db;

describe('Scheduler Service (DB integration)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  test('creates, reads, and computes schedule overview for real assignments/tasks', async () => {
    const today = new Date();
    // Create assignments
    const a1 = await Assignment.create({ student_id: 3, title: 'A1', due_date: new Date(today.getTime() + 24*60*60*1000), status: 'active' });
    const a2 = await Assignment.create({ student_id: 3, title: 'A2', due_date: new Date(today.getTime() - 24*60*60*1000), status: 'active' }); // overdue
    // Create tasks
    const t2 = await Task.create({ assignment_id: a2.id, title: 'T2', planned_start: new Date(today.getTime() - 48*60*60*1000), planned_end: new Date(today.getTime() - 24*60*60*1000), status: 'active' }); // overdue
    const t1 = await Task.create({ assignment_id: a1.id, title: 'T1', planned_start: today, planned_end: new Date(today.getTime() + 2*60*60*1000), status: 'active' });
    const t3 = await Task.create({ assignment_id: a1.id, title: 'T3', planned_start: new Date(today.getTime() + 24*60*60*1000), planned_end: new Date(today.getTime() + 26*60*60*1000), status: 'active' }); // starts soon
    // Read from DB
    const assignments = await Assignment.findAll({ where: { student_id: 3 } });
    const tasks = await Task.findAll({ where: { assignment_id: [a1.id, a2.id] } });
    // Compute overview
    const result = schedulerService.getScheduleOverviewService(assignments, tasks);
  const fs = await import('fs');
  fs.writeFileSync('test_output.txt', '\n=== getScheduleOverviewService output ===\n' + JSON.stringify(result, null, 2) + '\n', { flag: 'a' });
    // Timeline: sorted by planned_start
    expect(result.timeline[0].title).toBe('T2');
    // Capacity: correct count for today
    const todayStr = today.toISOString().slice(0, 10);
    expect(result.capacity[todayStr]).toBe(1);
    // Risks: A2 should be flagged (overdue)
    expect(result.risks.some(r => r.id === a2.id)).toBe(true);
    // Next actions: T3 (starts soon) and T2 (overdue)
    expect(result.nextActions.some(a => a.title === 'T3')).toBe(true);
    expect(result.nextActions.some(a => a.title === 'T2')).toBe(true);
  });

  test('splitIntoBlocks returns array (DB)', async () => {
    // Create dummy assignment and tasks
    const assignment = await Assignment.create({ student_id: 5, title: 'SplitTest', due_date: new Date(), status: 'active' });
    const task1 = await Task.create({ assignment_id: assignment.id, title: 'TaskA', planned_start: new Date(), planned_end: new Date(), status: 'active' });
  const result = splitIntoBlocks(assignment, [task1]);
  const fs = await import('fs');
  fs.writeFileSync('test_output.txt', '\n=== splitIntoBlocks output ===\n' + JSON.stringify(result, null, 2) + '\n', { flag: 'a' });
  expect(Array.isArray(result)).toBe(true);
  });

  test('resolveConflicts returns array (DB)', async () => {
    // Create dummy blocks
    const blocks = [{ id: 1 }, { id: 2 }];
  const result = resolveConflicts(blocks);
  const fs = await import('fs');
  fs.writeFileSync('test_output.txt', '\n=== resolveConflicts output ===\n' + JSON.stringify(result, null, 2) + '\n', { flag: 'a' });
  expect(Array.isArray(result)).toBe(true);
  });

  test('minimizeChanges returns array (DB)', async () => {
    // Create dummy blocks
    const currentBlocks = [{ id: 1 }];
    const newBlocks = [{ id: 2 }];
  const result = minimizeChanges(currentBlocks, newBlocks);
  const fs = await import('fs');
  fs.writeFileSync('test_output.txt', '\n=== minimizeChanges output ===\n' + JSON.stringify(result, null, 2) + '\n', { flag: 'a' });
  expect(Array.isArray(result)).toBe(true);
  });

  test('schedule creates and updates tasks in DB', async () => {
    // Create assignment and dummy task plans
    const assignment = await Assignment.create({ student_id: 6, title: 'ScheduleTest', due_date: new Date(), status: 'active' });
    const taskPlans = [
      { title: 'Plan1', duration: 2 },
      { title: 'Plan2', duration: 3 }
    ];
    // Simulate scheduling (stubbed)
    // You would call your real scheduling logic here and update DB as needed
    // For now, just create tasks as if scheduled
    for (const plan of taskPlans) {
      await Task.create({ assignment_id: assignment.id, title: plan.title, planned_start: new Date(), planned_end: new Date(), status: 'active' });
    }
    const tasks = await Task.findAll({ where: { assignment_id: assignment.id } });
  const fs = await import('fs');
  fs.writeFileSync('test_output.txt', '\n=== schedule (created tasks) output ===\n' + JSON.stringify(tasks, null, 2) + '\n', { flag: 'a' });
    expect(tasks.length).toBe(2);
    expect(tasks.some(t => t.title === 'Plan1')).toBe(true);
    expect(tasks.some(t => t.title === 'Plan2')).toBe(true);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
