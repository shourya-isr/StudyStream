import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe('Task API', () => {
  let createdTaskId;
  let assignmentId;

  beforeAll(async () => {
    // Clean database tables before testing
  const db = (await import('../db/init.js')).default;
  const { Assignment, Task, ScheduleVersion, WorkSession } = db;
    await WorkSession.destroy({ where: {}, truncate: true, force: true });
    await Task.destroy({ where: {}, truncate: true, force: true });
    await ScheduleVersion.destroy({ where: {}, truncate: true, force: true });
    await Assignment.destroy({ where: {}, truncate: true, force: true });

    // Create an assignment to use for tasks
    const res = await request(app)
      .post('/api/assignments')
      .send({
        student_id: 1,
        title: 'Task Test Assignment',
        description: 'Assignment for task tests',
        course: 'Science 101',
        due_date: '2025-09-30',
        priority: 'medium', // ENUM: 'low', 'medium', 'high'
        media: '',
        estimatedhours: 60,
  complexity: 'medium', // ENUM: 'low', 'medium', 'high'
        status: 'active' // ENUM: 'active', 'cancelled', 'deleted'
      });
  assignmentId = res.body.assignment ? res.body.assignment.id : res.body.id;
  });

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        assignment_id: assignmentId,
        title: 'Test Task',
        description: 'Test task description',
        planned_start: '2025-09-20',
        planned_end: '2025-09-21',
        priority: 'medium', // ENUM: 'low', 'medium', 'high'
        status: 'pending' // ENUM: 'pending', 'completed', etc. (if defined in model)
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdTaskId = res.body.id;
  });

  it('should get the created task', async () => {
    const res = await request(app).get(`/api/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Task');
  });

  it('should update the task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}`)
      .send({ status: 'completed' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('should delete the task', async () => {
    const res = await request(app).delete(`/api/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });
});
