import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to delay execution (sleep)
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const generateTestQuestions = async (subject, board, topics, count = 10, retries = 3) => {
  const prompt = `
    Generate a ${count}-question multiple choice test for ${board} board students on the subject of ${subject}. 
    The test must ONLY cover the following topics: ${topics.join(', ')}.
    
    CRITICAL INSTRUCTION: For each question's 'topicTag', you MUST use exact string matches from the provided topics list. Do not invent new topics.
    Valid topics for this test: [${topics.join(', ')}]
  `;

  // We define the models we want to try in order of preference
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.6-flash'];

  for (let attempt = 0; attempt < retries; attempt++) {
    // Pick the model based on the attempt number (or stick to the last one if we run out of new ones)
    const modelIndex = Math.min(attempt, modelsToTry.length - 1);
    const currentModel = modelsToTry[modelIndex];

    try {
      console.log(`Attempt ${attempt + 1}: Contacting ${currentModel}...`);
      
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              questions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    questionText: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    correctIndex: { type: "INTEGER" },
                    topicTag: { type: "STRING" },
                    difficulty: { type: "STRING" }
                  },
                  required: ["questionText", "options", "correctIndex", "topicTag", "difficulty"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      console.log("Success!");
      return JSON.parse(response.text).questions;

    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
      
      // If this was our last attempt, throw the error up to the controller
      if (attempt === retries - 1) {
        throw new Error(`All ${retries} attempts failed. Last error: ${error.message}`);
      }

      // Exponential backoff: Wait 2s, then 4s, etc., before trying again
      const waitTime = Math.pow(2, attempt) * 2000;
      console.log(`Waiting ${waitTime}ms before retrying...`);
      await delay(waitTime);
    }
  }
};