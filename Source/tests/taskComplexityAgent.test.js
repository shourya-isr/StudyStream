import { describe, it, expect, jest } from '@jest/globals';
import * as TaskComplexityAgent from '../services/taskComplexityAgent.js';

describe('TaskComplexityAgent', () => {
  it('should return structured task analysis from StudyStream AI agent', async () => {
    const mediaPath = '/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/1696828586_Paper_1_Mock_Exam_1.pdf';
    const question = 'Analyze this assignment and break it down into actionable tasks with estimated durations and complexity.';
    const result = await TaskComplexityAgent.analyzeTaskComplexity(mediaPath, question);
    console.log('AI output:', result);
    expect(result).toHaveProperty('totalEstimatedDuration');
    expect(result).toHaveProperty('overallComplexity');
    expect(Array.isArray(result.possibleTasks)).toBe(true);
    expect(result.possibleTasks.length).toBeGreaterThan(0);
    expect(result.possibleTasks[0]).toHaveProperty('title');
    expect(result.possibleTasks[0]).toHaveProperty('duration');
    expect(result.possibleTasks[0]).toHaveProperty('complexity');
  });
  jest.setTimeout(60000); // Increase timeout to 60 seconds
});