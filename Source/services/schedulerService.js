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

async function schedule(assignment, taskPlans, earliestStart) {
  // Step 1: Get unavailable slots from calendar
  console.log('SchedulerService: Received assignment:', assignment);
  console.log('SchedulerService: Received scrubbed task plans:', taskPlans);
      const unavailableSlots = await CalendarService.getAvailability(assignment.student_id);
      // assignment, scrubbedTaskPlans, earliestStart are passed as arguments
      const plannerInput = {
        assignment,
        scrubbedTaskPlans: taskPlans,
        unavailableSlots,
        earliestStart
        // Add conflictingTasks if available
      };
  console.log('SchedulerService: Received unavailable slots:', unavailableSlots);
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
