// AssignmentService: coordinates agents/services and updates the DB
import db from '../models/index.js';
import TaskComplexityAgent from './taskComplexityAgent.js';
import SchedulerService from './schedulerService.js';

export default {
  async createAssignment(data) {
    return await db.Assignment.create(data);
  },
  async analyzeMediaForTasks(assignment) {
    // Pass absolute media path to TaskComplexityAgent
    const result = await TaskComplexityAgent.analyze(assignment.media);
    console.log('AssignmentService: TaskComplexityAgent result:', result);
    // Scrub complexity from possibleTasks
    const scrubbedTasks = result.possibleTasks.map(({ title, duration }) => ({ title, duration }));
    console.log('AssignmentService: Scrubbed task plans:', scrubbedTasks);
    return scrubbedTasks;
  },
  async scheduleTasksWithCalendar(assignment, scrubbedTaskPlans) {
    // Passes full assignment details and scrubbed task plans to SchedulerService
    console.log('AssignmentService: Passing to SchedulerService:', { assignment, scrubbedTaskPlans });
    return await SchedulerService.schedule(assignment, scrubbedTaskPlans);
  },
  async updateAssignmentWithTasks(assignmentId, tasks) {
    // Bulk create tasks and associate with assignment
    const createdTasks = await db.Task.bulkCreate(
      tasks.map(task => ({ ...task, assignment_id: assignmentId }))
    );
    return createdTasks;
  }
};
