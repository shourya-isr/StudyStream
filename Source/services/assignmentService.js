// Removed duplicate updateAssignment function definition
// AssignmentService: coordinates agents/services and updates the DB

import db from '../models/index.js';
import TaskComplexityAgent from './taskComplexityAgent.js';
import SchedulerService from './schedulerService.js';

// Helper to create a new ScheduleVersion
async function createScheduleVersion(assignmentId, cause, diff, warnings, feedback = null) {
  if (!db.ScheduleVersion) return null;
  // Get latest version_number for this assignment
  const lastVersion = await db.ScheduleVersion.findOne({
    where: { assignment_id: assignmentId },
    order: [['version_number', 'DESC']]
  });
  const nextVersion = lastVersion ? lastVersion.version_number + 1 : 1;
  return await db.ScheduleVersion.create({
    assignment_id: assignmentId,
    version_number: nextVersion,
    cause,
    diff: JSON.stringify(diff),
    warnings: JSON.stringify(warnings),
    feedback
  });
}

export default {
  // ...existing code...
  async notifyTaskComplete(taskId, actualDuration, feedback = 'efficient') {
    // Update task status to completed
    const task = await db.Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');
    await task.update({ status: 'completed' });
    // Check if all tasks for assignment are completed
    const assignment = await db.Assignment.findByPk(task.assignment_id);
    const allTasks = await db.Task.findAll({ where: { assignment_id: assignment.id } });
    const allCompleted = allTasks.every(t => t.status === 'completed');
    if (allCompleted) await assignment.update({ status: 'completed' });
    // Gather future and conflicting tasks
    const activeTasks = allTasks.filter(t => t.status === 'active');
    const studentAssignments = await db.Assignment.findAll({ where: { student_id: assignment.student_id } });
    const assignmentIds = studentAssignments.map(a => a.id);
    const allStudentTasks = await db.Task.findAll({ where: { assignment_id: assignmentIds } });
    let conflictingTasks = [];
    let dueDateObj = assignment.due_date;
    if (typeof dueDateObj === 'string') dueDateObj = new Date(Date.parse(dueDateObj));
    if (dueDateObj instanceof Date && !isNaN(dueDateObj.getTime())) {
      conflictingTasks = allStudentTasks.filter(task => {
        if (!task.planned_start) return false;
        const taskStart = typeof task.planned_start === 'string' ? new Date(task.planned_start) : task.planned_start;
        return taskStart instanceof Date && !isNaN(taskStart.getTime()) && taskStart < dueDateObj;
      });
    }
    // Call SchedulerService to replan with feedback
  const replanResult = await SchedulerService.replanSchedule(assignment, activeTasks, conflictingTasks, feedback);
    // Record new ScheduleVersion
    await createScheduleVersion(assignment.id, 'telemetry-complete', replanResult.scheduledTasks || [], replanResult.warnings || [], feedback);
    return replanResult;
  },

  async notifyTaskPaused(taskId, actualDuration, feedback = 'paused') {
    // Update task status to paused
    const task = await db.Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');
    await task.update({ status: 'paused' });
    // Gather future and conflicting tasks
    const assignment = await db.Assignment.findByPk(task.assignment_id);
    const allTasks = await db.Task.findAll({ where: { assignment_id: assignment.id } });
    const activeTasks = allTasks.filter(t => t.status === 'active');
    const studentAssignments = await db.Assignment.findAll({ where: { student_id: assignment.student_id } });
    const assignmentIds = studentAssignments.map(a => a.id);
    const allStudentTasks = await db.Task.findAll({ where: { assignment_id: assignmentIds } });
    let conflictingTasks = [];
    let dueDateObj = assignment.due_date;
    if (typeof dueDateObj === 'string') dueDateObj = new Date(Date.parse(dueDateObj));
    if (dueDateObj instanceof Date && !isNaN(dueDateObj.getTime())) {
      conflictingTasks = allStudentTasks.filter(task => {
        if (!task.planned_start) return false;
        const taskStart = typeof task.planned_start === 'string' ? new Date(task.planned_start) : task.planned_start;
        return taskStart instanceof Date && !isNaN(taskStart.getTime()) && taskStart < dueDateObj;
      });
    }
    // Call SchedulerService to replan with feedback
  const replanResult = await SchedulerService.replanSchedule(assignment, activeTasks, conflictingTasks, feedback);
    // Record new ScheduleVersion
    await createScheduleVersion(assignment.id, 'telemetry-paused', replanResult.scheduledTasks || [], replanResult.warnings || [], feedback);
    return replanResult;
  },
  async updateAssignment(id, data) {
    // 1. Update assignment metadata
    const assignment = await db.Assignment.findByPk(id);
    if (!assignment) throw new Error('Assignment not found');

    // Determine if schedule needs to be replanned
    const shouldReplan =
      (data.priority && data.priority !== assignment.priority) ||
      (data.due_date && data.due_date !== assignment.due_date);

    await assignment.update(data);

    let updatedTasks = [];
    let warnings = [];

    if (shouldReplan) {
      // 2. Fetch all related tasks
      const allTasks = await db.Task.findAll({ where: { assignment_id: id } });
      const activeTasks = allTasks.filter(t => t.status === 'active');

      // 3. Fetch all assignments for the student, get all tasks for those assignments, filter by planned_start < assignment due date
      let dueDateObj = assignment.due_date;
      if (typeof dueDateObj === 'string') {
        const parsed = Date.parse(dueDateObj);
        if (!isNaN(parsed)) {
          dueDateObj = new Date(parsed);
        } else {
          dueDateObj = null;
        }
      }
      // Get all assignments for this student
      const studentAssignments = await db.Assignment.findAll({ where: { student_id: assignment.student_id } });
      const assignmentIds = studentAssignments.map(a => a.id);
      // Get all tasks for those assignments
      const allStudentTasks = await db.Task.findAll({ where: { assignment_id: assignmentIds } });
      let conflictingTasks = [];
      if (dueDateObj instanceof Date && !isNaN(dueDateObj.getTime())) {
        conflictingTasks = allStudentTasks.filter(task => {
          if (!task.planned_start) return false;
          const taskStart = typeof task.planned_start === 'string' ? new Date(task.planned_start) : task.planned_start;
          return taskStart instanceof Date && !isNaN(taskStart.getTime()) && taskStart < dueDateObj;
        });
      }

      // 4. Call SchedulerService to replan
  const replanResult = await SchedulerService.replanSchedule(assignment, activeTasks, conflictingTasks);
      updatedTasks = replanResult.scheduledTasks || [];
      warnings = replanResult.warnings || [];

      // 5. Delete all active tasks for this assignment
      await db.Task.destroy({ where: { assignment_id: id, status: 'active' } });

      // 6. Bulk create new tasks from updatedTasks
      const createdTasks = await db.Task.bulkCreate(
        updatedTasks.map(task => ({
          assignment_id: id,
          title: task.title,
          description: task.description ?? '',
          planned_start: (task.planned_start && !isNaN(Date.parse(task.planned_start))) ? new Date(task.planned_start).toISOString() : null,
          planned_end: (task.planned_end && !isNaN(Date.parse(task.planned_end))) ? new Date(task.planned_end).toISOString() : null,
          duration: task.duration ?? 0,
          priority: task.priority ?? assignment.priority ?? 'medium',
          status: task.status ?? 'active',
        }))
      );
      updatedTasks = createdTasks;

      // 7. Bump assignment version (if versioning supported)
      if ('version' in assignment) {
        assignment.version = (assignment.version || 0) + 1;
        await assignment.save();
      }

      // 8. Record new ScheduleVersion
      await createScheduleVersion(assignment.id, 'update', updatedTasks, warnings);
    }

    // 8. Return updated assignment, updated tasks, scheduleVersionId, warnings
    return {
      updatedAssignment: assignment,
      updatedTasks,
      warnings
    };
  },
  async createAssignment(data) {
    // Ensure rationale is always present
    if (!('rationale' in data)) {
      data.rationale = '';
    }
    const assignment = await db.Assignment.create(data);
    // After assignment is created and tasks are scheduled, record initial schedule version
    // This will be called from controller after scheduling tasks
    return assignment;
  },
  async analyzeMediaForTasks(assignment) {
  // Pass absolute media path to TaskComplexityAgent
  let result;
  try {
    result = await TaskComplexityAgent.analyze(assignment.media);
    // If result is a string, try to parse as JSON
    if (typeof result === 'string') {
      // Remove any comments (// ...), then parse
      result = result.replace(/\/\/.*$/gm, '');
      result = JSON.parse(result);
    }
  } catch (e) {
    throw new Error('TaskComplexityAgent did not return valid JSON: ' + (result || e.message));
  }
  console.log('AssignmentService: TaskComplexityAgent result:', result);
  console.log("Estimated Hours: " , result.totalEstimatedDuration);

  // Update assignment with estimatedhours, complexity, and rationale
  assignment.estimatedhours = result.totalEstimatedDuration;
  assignment.complexity = result.overallComplexity;
  assignment.rationale = result.rationale;
  // Log assignment instance before update
  console.log('Assignment before update:', assignment.toJSON ? assignment.toJSON() : assignment);
  // Use update instead of save
  await assignment.update({
    estimatedhours: assignment.estimatedhours ?? 0,
    complexity: assignment.complexity ?? 'medium',
    rationale: assignment.rationale ?? ''
  });
  // Scrub complexity from possibleTasks and convert duration to number
  const scrubbedTasks = Array.isArray(result.possibleTasks)
    ? result.possibleTasks.map(({ title, duration }) => ({
        title,
        duration: typeof duration === 'string' ?
          (duration.match(/\d+(\.\d+)?/) ? parseFloat(duration.match(/\d+(\.\d+)?/)[0]) : 0)
          : duration
      }))
    : [];
  console.log('AssignmentService: Scrubbed task plans:', scrubbedTasks);
  return scrubbedTasks;
  },
  async scheduleTasksWithCalendar(assignment, scrubbedTaskPlans) {
    // Passes full assignment details and scrubbed task plans to SchedulerService
    console.log('AssignmentService: Passing to SchedulerService:', { assignment, scrubbedTaskPlans });
    // Only send minimal assignment fields needed for scheduling, now with updated estimatedhours and complexity
    const assignmentPayload = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      estimatedhours: assignment.estimatedhours,
      complexity: assignment.complexity,
      priority: assignment.priority,
      course: assignment.course
    };
    // Add earliestStart as current timestamp
    const earliestStart = new Date().toISOString();
    const scheduleResult = await SchedulerService.schedule(assignmentPayload, scrubbedTaskPlans, earliestStart);
    // Save scheduled tasks to DB
    if (scheduleResult && Array.isArray(scheduleResult.scheduledTasks)) {
      const createdTasks = await db.Task.bulkCreate(
        scheduleResult.scheduledTasks.map(task => ({
          assignment_id: assignment.id,
          title: task.title,
          description: task.description ?? '',
          planned_start: (task.planned_start && !isNaN(Date.parse(task.planned_start))) ? new Date(task.planned_start).toISOString() : null,
          planned_end: (task.planned_end && !isNaN(Date.parse(task.planned_end))) ? new Date(task.planned_end).toISOString() : null,
          duration: task.duration ?? 0,
          priority: task.priority ?? assignment.priority ?? 'medium',
          status: task.status ?? 'active',
        }))
      );
      scheduleResult.dbTasks = createdTasks;
      // Record initial schedule version
      await createScheduleVersion(assignment.id, 'create', createdTasks, scheduleResult.warnings || []);
    }
    return scheduleResult;
  },
  async updateAssignmentWithTasks(assignmentId, tasks) {
    // Bulk create tasks and associate with assignment
    const createdTasks = await db.Task.bulkCreate(
      tasks.map(task => ({ ...task, assignment_id: assignmentId }))
    );
    return createdTasks;
  }
};
