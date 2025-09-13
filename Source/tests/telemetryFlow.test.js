import db from '../models/index.js';
import TelemetryService from '../services/telemetryService.js';
import AssignmentService from '../services/assignmentService.js';

describe('Telemetry + Adaptive Scheduling Flow', () => {
  let assignment;
  let tasks;
  let session;
  let studentId = 42;

  beforeAll(async () => {
    // Clean DB
    await db.WorkSession.truncate({ cascade: true });
    await db.Task.truncate({ cascade: true });
    await db.ScheduleVersion.truncate({ cascade: true });
    await db.Assignment.truncate({ cascade: true });

    // Create assignment using realistic details
    assignment = await AssignmentService.createAssignment({
      student_id: 3,
      title: 'Homework',
      description: 'Test full workflow telemetry',
      course: '123',
      due_date: '2025-09-19',
      priority: 'high',
      media: '/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/1696828586_Paper_1_Mock_Exam_1.pdf',
      status: 'active',
      rationale: ''
    });
    // Agent-driven task planning
    const scrubbedTaskPlans = await AssignmentService.analyzeMediaForTasks(assignment);
    const scheduleResult = await AssignmentService.scheduleTasksWithCalendar(assignment, scrubbedTaskPlans);
    // Fetch actual agent-generated tasks
    tasks = await db.Task.findAll({ where: { assignment_id: assignment.id }, order: [['id', 'ASC']] });
  }, 60000);

  it('should start a session for the first task', async () => {
    session = await TelemetryService.startSession(tasks[0].id, studentId, 'Starting work');
    expect(session).toHaveProperty('id');
    expect(session.task_id).toBe(tasks[0].id);
    expect(session.student_id).toBe(studentId);
    expect(session.start_time).toBeTruthy();
    expect(session.end_time).toBeNull();
  }, 60000);

  it('should end the session with efficient feedback (finished 10 min before planned_end)', async () => {
    // Simulate ending 10 min before planned_end
    const fakeEnd = new Date(new Date(session.start_time).getTime() + 1000 * 60 * 110); // 110 min after start
    session.end_time = fakeEnd;
    session.duration = Math.round((fakeEnd - new Date(session.start_time)) / 1000);
    await session.save();
    const result = await AssignmentService.notifyTaskComplete(session.task_id, session.duration, 'efficient');
    expect(result).toHaveProperty('scheduledTasks');
    expect(result).toHaveProperty('warnings');
    // Check DB status
    const updatedTask = await db.Task.findByPk(session.task_id);
    expect(updatedTask.status).toBe('completed');
    // Check ScheduleVersion feedback
    const versions = await db.ScheduleVersion.findAll({ where: { assignment_id: assignment.id } });
    expect(versions.some(v => v.feedback === 'efficient')).toBe(true);
  }, 60000);

  it('should start and end a session with overrun feedback (finished 10 min after planned_end)', async () => {
    const newSession = await TelemetryService.startSession(tasks[1].id, studentId, 'Starting work');
    const fakeEnd = new Date(new Date(newSession.start_time).getTime() + 1000 * 60 * 130); // 130 min after start
    newSession.end_time = fakeEnd;
    newSession.duration = Math.round((fakeEnd - new Date(newSession.start_time)) / 1000);
    await newSession.save();
    const result = await AssignmentService.notifyTaskComplete(newSession.task_id, newSession.duration, 'overrun');
    expect(result).toHaveProperty('scheduledTasks');
    expect(result).toHaveProperty('warnings');
    const updatedTask = await db.Task.findByPk(newSession.task_id);
    expect(updatedTask.status).toBe('completed');
    const versions = await db.ScheduleVersion.findAll({ where: { assignment_id: assignment.id } });
    expect(versions.some(v => v.feedback === 'overrun')).toBe(true);
  }, 60000);

  it('should pause a session and trigger paused feedback', async () => {
    // Start a new session for Task 2 again (simulate user resumes and pauses)
    const pauseSession = await TelemetryService.startSession(tasks[1].id, studentId, 'Resuming work');
    // Simulate pause
    const result = await TelemetryService.pauseSession(pauseSession.id, 'Paused for break');
    expect(result.notes).toContain('paused');
    const updatedTask = await db.Task.findByPk(pauseSession.task_id);
    expect(updatedTask.status).toBe('paused');
    const versions = await db.ScheduleVersion.findAll({ where: { assignment_id: assignment.id } });
    expect(versions.some(v => v.feedback === 'paused')).toBe(true);
  }, 60000);
});
