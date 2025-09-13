// PlannerAgent: plans tasks using calendar data

import 'dotenv/config';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY_PAID });

const assistantId = "asst_4Bp776ztrdeQp418C7Zr9sFQ";
const instructions = `You are StudyStream's Planner Agent. Your job is to create a personalized, actionable schedule for a student to complete their assignment on time.\n\nYour output must be a strict JSON object in this format:\n{\n  scheduledTasks: [\n    {\n      title: string,\n      duration: number,\n      planned_start: string, // ISO 8601 datetime\n      planned_end: string    // ISO 8601 datetime\n    }\n  ],\n  warnings: [string]\n}\n\nScheduling Rules:\n- You must NEVER schedule any task during any unavailable slot, which includes blocked slots and all calendar events, regardless of priority.\n- Unavailable slots are provided as an array of objects: { start, end, summary } in ISO 8601 format.\n- Scheduled tasks must fit entirely within available time slots.\n- Any overlap (even partial) with an unavailable slot is strictly forbidden.\n- No single scheduled task can be less than 30 minutes in duration.\n- If no available slot is long enough for a task, split the task or add a warning.\n- If a task cannot be scheduled before the due date, add a warning explaining why.\n\nOutput Rules:\n- Respond ONLY with the JSON object.\n- Do NOT include any explanation, commentary, or extra text.\n\nGoal:\n- Help students finish assignments on time, reduce stress, and provide a clear, actionable plan with zero conflicts.\n- The schedule must be easy to follow and update if needed.`;

async function plan(assignment, taskPlans, calendarData) {
  // Prepare input for the assistant
  const input = {
    assignment,
    tasks: taskPlans,
    unavailableSlots: calendarData
  };

  // Step 1: Create thread with message
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: `Assignment: ${JSON.stringify(input.assignment)}\nTasks: ${JSON.stringify(input.tasks)}\nUnavailableSlots: ${JSON.stringify(input.unavailableSlots)}`
      }
    ]
  });

  // Step 2: Create run and get output
  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
    instructions,
    model: "gpt-4.1-nano"
  });

  const messages = await openai.beta.threads.messages.list(thread.id, {
    run_id: run.id,
  });

  const message = messages.data.pop();
  if (message && message.content[0].type === "text") {
    // Expecting ONLY JSON, no extra text
    let json;
    try {
      json = JSON.parse(message.content[0].text.value);
    } catch (e) {
      throw new Error("PlannerAgent response was not valid JSON: " + message.content[0].text.value);
    }
    // Validate schema
    if (
      Array.isArray(json.scheduledTasks) &&
      Array.isArray(json.warnings)
    ) {
      return json;
    } else {
      throw new Error("PlannerAgent response JSON does not match required schema: " + JSON.stringify(json));
    }
  }
  throw new Error("No valid response from assistant");
}

export default { plan };
