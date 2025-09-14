/**
 * Syncs all tasks for an assignment to Google Calendar: deletes old events, then adds current tasks.
 * @param {number} studentId
 * @param {Array} tasks - Array of task objects from DB
 * @param {object} oauth2Client - Authenticated Google OAuth2 client
 * @returns {Array} createdEvents - Array of created Google Calendar events
 */
// ...existing code...
/**
 * Computes schedule overview: timeline, capacity, risks, next actions.
 * @param {Array} assignments
 * @param {Array} tasks
 * @returns {Object} { timeline, capacity, risks, nextActions }
 */
export function getScheduleOverviewService(assignments, tasks) {
  const today = new Date();
  // Timeline
  const timeline = tasks.map(t => ({
    id: t.id,
    assignment_id: t.assignment_id,
    title: t.title,
    planned_start: t.planned_start,
    planned_end: t.planned_end,
    status: t.status
  })).sort((a, b) => new Date(a.planned_start) - new Date(b.planned_start));
  // Capacity (tasks per day for next 7 days)
  const capacity = {};
  for (let i = 0; i < 7; i++) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dayStr = day.toISOString().slice(0, 10);
    capacity[dayStr] = tasks.filter(t => t.planned_start && new Date(t.planned_start).toISOString().slice(0, 10) === dayStr).length;
  }
  // Risks
  const risks = assignments.filter(a => {
    const aTasks = tasks.filter(t => t.assignment_id === a.id);
    const overdue = aTasks.some(t => t.planned_end && new Date(t.planned_end) < today && t.status === 'active');
    const remainingEffort = aTasks.filter(t => t.status === 'active').reduce((sum, t) => sum + (t.duration || 0), 0);
    const timeLeft = Math.max(0, Math.floor((new Date(a.due_date) - today) / (1000 * 60 * 60)));
    return overdue || remainingEffort > timeLeft;
  }).map(a => ({ id: a.id, title: a.title, due_date: a.due_date }));
  // Next actions
  const nextActions = tasks.filter(t => {
    const start = t.planned_start ? new Date(t.planned_start) : null;
    return (start && start >= today && start <= new Date(today.getTime() + 48 * 60 * 60 * 1000)) || (t.planned_end && new Date(t.planned_end) < today && t.status === 'active');
  }).map(t => ({ id: t.id, title: t.title, planned_start: t.planned_start, planned_end: t.planned_end, status: t.status }));
  return { timeline, capacity, risks, nextActions };
}
// Scheduler Service Stub
// Implements: splitIntoBlocks, resolveConflicts, minimizeChanges
// Scheduler Service Stub
// Implements: splitIntoBlocks, resolveConflicts, minimizeChanges

/**
 * Splits assignment tasks into time blocks based on constraints.
 * @param {Object} assignment
 * @param {Array} existingTasks
 * @returns {Array} blocks
 */
function splitIntoBlocks(assignment, existingTasks) {
  // TODO: Implement block splitting logic
  return [];
}

/**
 * Resolves scheduling conflicts among tasks.
 * @param {Array} blocks
 * @returns {Array} resolvedBlocks
 */
function resolveConflicts(blocks) {
  // TODO: Implement conflict resolution
  return blocks;
}

/**
 * Minimizes changes to the schedule when replanning.
 * @param {Array} currentBlocks
 * @param {Array} newBlocks
 * @returns {Array} minimizedBlocks
 */
function minimizeChanges(currentBlocks, newBlocks) {
  // TODO: Implement change minimization
  return newBlocks;
}

import PlannerAgent from './plannerAgent.js';
import CalendarService from './calendarService.js';

/**
 * Schedules or replans tasks for an assignment.
 * @param {Object} assignment
 * @param {Array} taskPlans
 * @param {String} earliestStart
 * @param {Object} [constraints] Optional. { conflictingTasks, mode }
 * @returns {Object} PlannerAgent result
 */
async function schedule(assignment, taskPlans, earliestStart, constraints = {}, oauth2Client) {
  // Step 1: Get unavailable slots from Google Calendar
  console.log('SchedulerService: Received assignment:', assignment);
  console.log('SchedulerService: Received scrubbed task plans:', taskPlans);
  const unavailableSlots = await CalendarService.getAvailability(assignment.student_id, oauth2Client);
  // Compose planner input
  const plannerInput = {
    assignment,
    scrubbedTaskPlans: taskPlans,
    unavailableSlots,
    earliestStart,
    ...(constraints.conflictingTasks ? { conflictingTasks: constraints.conflictingTasks } : {}),
    ...(constraints.mode ? { mode: constraints.mode } : {}),
    ...(constraints.feedback ? { feedback: constraints.feedback } : {})
  };
  console.log('SchedulerService: Received unavailable slots:', unavailableSlots);
  console.log('SchedulerService: Planner input:', plannerInput);
  // Step 2: Pass full assignment details and unavailable slots to PlannerAgent
  const result = await PlannerAgent.plan(plannerInput);
  console.log('SchedulerService: PlannerAgent result:', result);
  return result;
}

export default {
  /**
   * Syncs all tasks for an assignment to Google Calendar: deletes old events, then adds current tasks.
   */
  async syncTasksToGoogleCalendar(studentId, tasks, oauth2Client) {
    // Delete all events for this assignment before creating new ones
    if (tasks.length > 0) {
      const assignment = tasks[0].assignment_id ? { id: tasks[0].assignment_id } : null;
      if (assignment) {
        await CalendarService.deleteTaskEventsFromGoogleCalendar(studentId, assignment, oauth2Client);
      }
    }
    // Add current tasks as events
    const createdEvents = await CalendarService.exportTasksToGoogleCalendar(studentId, oauth2Client);
    return createdEvents;
  },
  splitIntoBlocks,
  resolveConflicts,
  minimizeChanges,
  getScheduleOverviewService,
  /**
   * Replans schedule for an updated assignment, following the update flow.
   * Delegates to schedule with mode='replan' and conflictingTasks.
   * @param {Object} assignment
   * @param {Array} activeTasks
   * @param {Array} conflictingTasks
   * @returns {Object} PlannerAgent result
   */
  async replanSchedule(assignment, activeTasks, conflictingTasks, feedback = 'neutral') {
    const earliestStart = new Date().toISOString();
    return await schedule(
      assignment,
      activeTasks,
      earliestStart,
      { conflictingTasks, mode: 'replan', feedback }
    );
  },
  /**
   * Plans tasks for an assignment, following the sequence diagram.
   * @param {Object} assignment
   * @param {Object} constraints
   * @param {Array} existingTasks
   * @returns {Object} TaskDiff { created: Task[], warnings: string[] }
   */
  async plan(assignment, constraints, existingTasks) {
    // Step 1: Compute slots (stub)
    // Step 2: Split into blocks
    let blocks = splitIntoBlocks(assignment, existingTasks);
    // Step 3: Resolve conflicts
    let resolvedBlocks = resolveConflicts(blocks);
    // Step 4: Generate created tasks (stub)
    // For now, just create a single task as a placeholder
    // Pass priority as ENUM string
    const created = [
      {
        title: assignment.title + ' - Task 1',
        description: assignment.description || '',
        planned_start: assignment.due_date,
        planned_end: assignment.due_date,
        priority: assignment.priority || 'medium',
  status: 'active',
      }
    ];
    // Step 5: Warnings (stub)
    const warnings = [];
    return { created, warnings };
  },
  schedule
};
