import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe('Assignment API', () => {
  beforeAll(async () => {
    // Clean database tables before testing
  const db = (await import('../db/init.js')).default;
  const { Assignment, Task, ScheduleVersion, WorkSession } = db;
    await WorkSession.destroy({ where: {}, truncate: true, force: true });
    await Task.destroy({ where: {}, truncate: true, force: true });
    await ScheduleVersion.destroy({ where: {}, truncate: true, force: true });
    await Assignment.destroy({ where: {}, truncate: true, force: true });
  });

  it('should create a new assignment', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .send({
        student_id: 1,
        title: 'Test Assignment',
        description: 'Test description',
        course: 'Math 101',
        due_date: '2025-09-30',
        priority: 'high',
  media: '/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/Maths Test.pdf',
        estimatedhours: 120,
  complexity: 'high',
        status: 'active'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.assignment).toHaveProperty('id');
    expect(res.body.assignment.title).toBe('Test Assignment');
    // New: Check scheduledTasks structure
    expect(Array.isArray(res.body.scheduledTasks)).toBe(true);
    expect(res.body.scheduledTasks.length).toBeGreaterThan(0);
    expect(res.body.scheduledTasks[0]).toHaveProperty('title');
    expect(res.body.scheduledTasks[0]).toHaveProperty('duration');
    expect(res.body.scheduledTasks[0]).toHaveProperty('complexity');
    expect(res.body.scheduledTasks[0]).toHaveProperty('planned_start');
    expect(res.body.scheduledTasks[0]).toHaveProperty('planned_end');
  });
});
