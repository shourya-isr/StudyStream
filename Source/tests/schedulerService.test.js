import { describe, test, expect } from '@jest/globals';
import scheduler from '../services/schedulerService.js';

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
});
