import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import * as pdfParseModule from "pdf-parse";
import { updateDB, readDB } from "./db";

// Using Gemini AI instead of OpenAI
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export async function processAiImportFast(jobId: string, filePath: string) {
  try {
    // 1. Read PDF
    const dataBuffer = fs.readFileSync(filePath);
    // @ts-ignore
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const pdfData = await pdfParse(dataBuffer);
    const contentText = pdfData.text.substring(0, 10000); // Limit to save tokens/time on demo

    // 2. Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an AI corporate course assistant.
Generate a course structure based on the following document.
Document:
${contentText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            course_title: { type: Type.STRING },
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  order: { type: Type.NUMBER },
                  lessons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                         title: { type: Type.STRING },
                         order: { type: Type.NUMBER },
                         lesson_type: { type: Type.STRING, description: "Must be 'text', 'video', or 'quiz'" },
                         content_markdown: { type: Type.STRING },
                         quiz_questions: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correct: { type: Type.NUMBER }
                              }
                            }
                         }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const outputJson = JSON.parse(response.text);

    // 3. Mark job as done
    updateDB((db) => {
      const job = db.aiJobs.find(j => j.id === jobId);
      if (job) {
        job.status = 'done';
        job.result_json = outputJson;
      }
    });

  } catch(error: any) {
    console.error("AI Error:", error);
    updateDB((db) => {
      const job = db.aiJobs.find(j => j.id === jobId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
      }
    });
  }
}
