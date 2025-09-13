import 'dotenv/config';
import fs from 'fs';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY_PAID });

async function analyze(pdfPath, question) {
  // ...existing code...
}

export { analyze as analyzeTaskComplexity };
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

export { analyze as analyzeTaskComplexity };
    return await analyze(pdfPath);
  }
};
