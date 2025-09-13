import { describe, test, expect, jest } from '@jest/globals';
import scheduler from '../services/schedulerService.js';
import CalendarService from '../services/calendarService.js';
import TaskComplexityAgent from '../services/taskComplexityAgent.js';

describe('Scheduler Service', () => {
  test('splitIntoBlocks returns array', () => {
    const result = scheduler.splitIntoBlocks({}, []);
    expect(Array.isArray(result)).toBe(true);
  });

  test('resolveConflicts returns array', () => {
    const result = scheduler.resolveConflicts([]);
    expect(Array.isArray(result)).toBe(true);
  });

  test('minimizeChanges returns array', () => {
    const result = scheduler.minimizeChanges([], []);
    expect(Array.isArray(result)).toBe(true);
  });

  test('schedule prints calendar and task plans JSON (real data)', async () => {
    // Get calendar data from CalendarService
    const calendarData = await CalendarService.getAvailability(1);
    // Get task plans from TaskComplexityAgent
  const analysis = await TaskComplexityAgent.analyze('/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/Maths Test.pdf');
    const scrubbedTaskPlans = analysis.possibleTasks.map(({ title, duration }) => ({ title, duration }));
    const assignment = { student_id: 1 };
    // Spy on console.log and capture output
    const logs = [];
    const logSpy = jest.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args.join(' '));
    });
    await scheduler.schedule(assignment, scrubbedTaskPlans);
    // Print captured logs to console
    logs.forEach(l => process.stdout.write(l + '\n'));
    // Check that both JSONs were printed and match expected structure
    expect(logs.some(str => str.includes('Scrubbed Task Plans'))).toBe(true);
    expect(logs.some(str => str.includes('Calendar JSON'))).toBe(true);
    logSpy.mockRestore();
  });
});
