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
async function schedule(assignment, taskPlans, earliestStart, constraints = {}) {
  // Step 1: Get unavailable slots from calendar
  console.log('SchedulerService: Received assignment:', assignment);
  console.log('SchedulerService: Received scrubbed task plans:', taskPlans);
  const unavailableSlots = await CalendarService.getAvailability(assignment.student_id);
  // Compose planner input
  const plannerInput = {
    assignment,
    scrubbedTaskPlans: taskPlans,
    unavailableSlots,
    earliestStart,
    // Only add conflictingTasks if present
    ...(constraints.conflictingTasks ? { conflictingTasks: constraints.conflictingTasks } : {}),
    // Add mode flag if present
    ...(constraints.mode ? { mode: constraints.mode } : {})
  };
  console.log('SchedulerService: Received unavailable slots:', unavailableSlots);
  console.log('SchedulerService: Planner input:', plannerInput);
  // Step 2: Pass full assignment details and unavailable slots to PlannerAgent
  const result = await PlannerAgent.plan(plannerInput);
  console.log('SchedulerService: PlannerAgent result:', result);
  return result;
}

export default {
  splitIntoBlocks,
  resolveConflicts,
  minimizeChanges,
  /**
   * Replans schedule for an updated assignment, following the update flow.
   * Delegates to schedule with mode='replan' and conflictingTasks.
   * @param {Object} assignment
   * @param {Array} activeTasks
   * @param {Array} conflictingTasks
   * @returns {Object} PlannerAgent result
   */
  async replanSchedule(assignment, activeTasks, conflictingTasks) {
    const earliestStart = new Date().toISOString();
    // Delegate to schedule with mode and conflictingTasks
    return await schedule(
      assignment,
      activeTasks,
      earliestStart,
      { conflictingTasks, mode: 'replan' }
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
