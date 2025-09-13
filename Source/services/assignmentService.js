// AssignmentService: coordinates agents/services and updates the DB
import db from '../models/index.js';
import TaskComplexityAgent from './taskComplexityAgent.js';
import SchedulerService from './schedulerService.js';

export default {
  async createAssignment(data) {
    // Ensure rationale is always present
    if (!('rationale' in data)) {
      data.rationale = '';
    }
    return await db.Assignment.create(data);
  },
  async analyzeMediaForTasks(assignment) {
  // Pass absolute media path to TaskComplexityAgent
  const result = await TaskComplexityAgent.analyze(assignment.media);
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
  // Scrub complexity from possibleTasks
  const scrubbedTasks = result.possibleTasks.map(({ title, duration }) => ({ title, duration }));
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
