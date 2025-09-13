// PlannerAgent: plans tasks using calendar data
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY_PAID });

const PLANNER_PROMPT = `You are StudyStream’s Planner Agent. Your job is to take a set of assignment tasks (each with a title and estimated duration), the full assignment details (including due date), and a student’s calendar availability, and generate a personalized, actionable schedule for completing the assignment on time. Your output must be a strict JSON object in the following format:\n\n{\n  "scheduledTasks": [\n    {\n      "title": string,\n      "duration": number,\n      "planned_start": string, // ISO 8601 datetime\n      "planned_end": string    // ISO 8601 datetime\n    }\n  ],\n  "warnings": [string]\n}\n\nInstructions:\n- Use the provided task list, assignment details (including due date), and calendar slots to distribute work sessions, avoiding conflicts and balancing workload.\n- Schedule tasks around lectures, routines, and extracurriculars, using only available calendar slots.\n- If a task cannot be scheduled before the due date, add a warning explaining why.\n- Do not include any commentary, explanation, or extra text—respond ONLY with the JSON object.\n- Your goal is to help students finish assignments on time, reduce stress, and provide a clear, actionable plan.\n\nContext:\n- Students may procrastinate or fall behind; your plan should be realistic and adaptive.\n- Progress will be tracked and feedback given as students work.\n- The schedule should be easy to follow and update if needed.`;

async function plan(assignment, taskPlans, calendarData) {
  // Prepare input for the assistant
  const input = {
    assignment,
    tasks: taskPlans,
    calendar: calendarData
  };

  // Compose message for OpenAI
  const messages = [
    {
      role: 'system',
      content: PLANNER_PROMPT
    },
    {
      role: 'user',
      content: `Assignment: ${JSON.stringify(input.assignment)}\nTasks: ${JSON.stringify(input.tasks)}\nCalendar: ${JSON.stringify(input.calendar)}`
    }
  ];

  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages,
    temperature: 0.4,
    max_tokens: 1024
  });

  // Debug: print raw model output
  console.log('PlannerAgent raw model output:', response.choices[0].message.content);

  // Parse and validate response
  let json;
  try {
    json = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error('PlannerAgent response was not valid JSON: ' + response.choices[0].message.content);
  }
  if (!Array.isArray(json.scheduledTasks) || !Array.isArray(json.warnings)) {
    throw new Error('PlannerAgent response JSON does not match required schema: ' + JSON.stringify(json));
  }
  return json;
}

export default { plan };
