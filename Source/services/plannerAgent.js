// PlannerAgent: plans tasks using calendar data
export default {
  async plan(assignment, taskPlans, calendarData) {
    // TODO: Integrate AI model for planning
    // Return scheduled tasks: [{ title, planned_start, planned_end, ... }, ...]
    return taskPlans.map((task, idx) => ({
      ...task,
      planned_start: calendarData[idx]?.start || assignment.due_date,
      planned_end: calendarData[idx]?.end || assignment.due_date
    }));
  }
};
