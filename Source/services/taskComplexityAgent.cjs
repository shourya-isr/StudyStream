require('dotenv').config();
const fs = require('fs');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY_PAID });
const prompt = `
You are an AI agent for StudyStream. Given the following assignment content, analyze and return:
- totalEstimatedDuration: total time in hours for all tasks
- overallComplexity: one of 'low', 'medium', or 'high'
- possibleTasks: array of objects with title, duration, complexity
Example response:
{
  totalEstimatedDuration: 7,
  overallComplexity: 'medium',
  possibleTasks: [
    { title: 'Read Chapter 1', duration: 2, complexity: 'medium' },
    { title: 'Solve Practice Problems', duration: 1, complexity: 'high' }
  ]
}
Assignment content:
`;

// This file is now obsolete after ESM migration. Use taskComplexityAgent.js instead.
// If you need to run the agent, use:
// node services/taskComplexityAgent.js
async function analyze(pdfPath) {
  // Extract text from PDF
  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(dataBuffer);
  const assignmentText = pdfData.text;
  console.log('Extracted assignment text:', assignmentText);

  // Build prompt
  const fullPrompt = `${prompt}\n${assignmentText}`;

  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: fullPrompt },
    ],
    temperature: 0.7,
  });
  const response = completion.data.choices[0].message.content;
  console.log('OpenAI response:', response);
  return response;
}

module.exports = { analyze };

// Runner for direct execution
if (require.main === module) {
  const pdfPath = '/Users/shourya-isr/Desktop/Coding/Projects/StudyStream/Source/media/Maths Test.pdf';
  analyze(pdfPath);
}
