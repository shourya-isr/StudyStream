import 'dotenv/config';
import fs from 'fs';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY_PAID });

export async function analyzeTaskComplexity(pdfPath, question) {
//   // Use provided assistant ID and strict instructions
//   const assistantId = "asst_4Bp776ztrdeQp418C7Zr9sFQ";
//   const instructions = `You are StudyStream's Task Complexity Agent. Your job is to analyze a PDF assignment and break it down into actionable, manageable steps for scheduling and progress tracking. For each assignment, respond ONLY with a JSON object in the following format:\n{\n  totalEstimatedDuration: number,\n  overallComplexity: 'low' | 'medium' | 'high',\n  possibleTasks: [\n    { title: string, duration: number, complexity: 'low' | 'medium' | 'high' }\n  ]\n}\n- totalEstimatedDuration: sum of all task durations in number of hours\n- overallComplexity: rate the assignment as 'low', 'medium', or 'high' based on the number, difficulty, and length of tasks\n- possibleTasks: break the assignment into clear, actionable steps, each with a short title, estimated duration (number of hours & minutes), and complexity\nThis output will be used for automated scheduling and progress tracking. Do NOT include any explanation, commentary, or extra text. Respond ONLY with the JSON object.`;
//   const model = "gpt-4.1-nano";

//   // Step 1: Upload file for message attachment
//   const file = await openai.files.create({
//     file: fs.createReadStream(pdfPath),
//     purpose: "assistants",
//   });

//   // Step 2: Create thread with message and file attachment
//   const thread = await openai.beta.threads.create({
//     messages: [
//       {
//         role: "user",
//         content: question,
//         attachments: [{ file_id: file.id, tools: [{ type: "file_search" }] }],
//       },
//     ],
//   });

//   // Step 3: Create run and get output
//   const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
//     assistant_id: assistantId,
//     instructions,
//     model,
//   });

//   const messages = await openai.beta.threads.messages.list(thread.id, {
//     run_id: run.id,
//   });

//   const message = messages.data.pop();
//   if (message && message.content[0].type === "text") {
//     // Expecting ONLY JSON, no extra text
//     let json;
//     try {
//       json = JSON.parse(message.content[0].text.value);
//     } catch (e) {
//       throw new Error("Response was not valid JSON: " + message.content[0].text.value);
//     }
//     // Validate schema
//     if (
//       typeof json.totalEstimatedDuration === "number" &&
//       ["low", "medium", "high"].includes(json.overallComplexity) &&
//       Array.isArray(json.possibleTasks) &&
//       json.possibleTasks.every(
//         t => typeof t.title === "string" &&
//              typeof t.duration === "number" &&
//              ["low", "medium", "high"].includes(t.complexity)
//       )
//     ) {
//       return json;
//     } else {
//       throw new Error("Response JSON does not match required schema: " + JSON.stringify(json));
//     }
//   }
//   throw new Error("No valid response from assistant");

return {
        totalEstimatedDuration: 20,
        overallComplexity: 'medium',
        possibleTasks: [
          {
            title: 'Read and understand the assignment brief and case study',
            duration: 2,
            complexity: 'low'
          },
          {
            title: 'Identify key issues and challenges faced by MT (software problems, financial issues, reputation damage)',
            duration: 2,
            complexity: 'medium'
          },
          {
            title: 'Break down the assignment requirements: analyze leadership style, ethical objectives, market strategy, financial options, and decision-making',
            duration: 4,
            complexity: 'medium'
          },
          {
            title: 'Research relevant theories on leadership types, business ethics, marketing mix, sources of finance, and strategic decision-making',
            duration: 6,
            complexity: 'high'
          },
          {
            title: 'Draft sections of the assignment answering the questions from Section A (definitions, description, explanation, analysis)',
            duration: 4,
            complexity: 'medium'
          },
          {
            title: 'Review and finalize the completed assignment',
            duration: 2,
            complexity: 'low'
          }
        ]
      }

}
