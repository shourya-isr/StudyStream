// AssignmentService: coordinates agents/services and updates the DB
import { Assignment, Task } from '../models/index.js';
import TaskComplexityAgent from './taskComplexityAgent.js';
import SchedulerService from './schedulerService.js';

export default {
  async createAssignment(data) {
    return await Assignment.create(data);
  },
  async analyzeMediaForTasks(assignment) {
    // Pass absolute media path to TaskComplexityAgent
    return await TaskComplexityAgent.analyze(assignment.media);
  },
  async scheduleTasksWithCalendar(assignment, taskPlans) {
    // Passes assignment and task plans to SchedulerService
    return await SchedulerService.schedule(assignment, taskPlans);
  },
  async updateAssignmentWithTasks(assignmentId, tasks) {
    // Bulk create tasks and associate with assignment
    const createdTasks = await Task.bulkCreate(
      tasks.map(task => ({ ...task, assignment_id: assignmentId }))
    );
    return createdTasks;
  }
};
