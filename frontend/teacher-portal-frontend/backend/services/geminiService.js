import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const QUESTION_COUNT_MIN = 1;
const QUESTION_COUNT_MAX = 50;

function normalizeQuestion(question, chapters) {
  const questionText = String(question.questionText || question.question || question.text || '').trim();
  const options = Array.isArray(question.options) ? question.options.map((option) => String(option).trim()).filter(Boolean) : [];
  const correctIndex = Number(question.correctIndex);
  const topicTag = String(question.topicTag || '').trim();
  if (!questionText || options.length !== 4 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3 || !chapters.includes(topicTag)) return null;
  return { type: 'MCQ', questionText, options, correctIndex, topicTag, difficulty: ['Easy', 'Medium', 'Hard'].includes(question.difficulty) ? question.difficulty : 'Medium' };
}

export const generateTestQuestions = async (subjects, grade, chapters, count = 10, retries = 3) => {
  const subjectList = Array.isArray(subjects) ? subjects : [subjects];
  const chapterList = Array.isArray(chapters) ? chapters : [chapters];
  const questionCount = Math.min(QUESTION_COUNT_MAX, Math.max(QUESTION_COUNT_MIN, Number(count) || 10));
  const prompt = [
    `Generate exactly ${questionCount} multiple-choice questions for grade ${grade}.`,
    `Subjects: ${subjectList.join(', ')}.`,
    `Allowed chapters only: ${chapterList.join(', ')}.`,
    'Every question must be based only on the allowed chapters.',
    'Every topicTag must exactly equal one of the allowed chapter strings.',
    'Each question must contain 4 answer options and correctIndex must be a zero-based integer from 0 to 3.',
    'Return only valid JSON in this shape: {"questions":[{"questionText":"...","options":["...","...","...","..."],"correctIndex":0,"topicTag":"exact chapter","difficulty":"Easy|Medium|Hard"}]}',
  ].join(' ');
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured.');
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });
      const parsed = JSON.parse(response.text || '{}');
      const questions = Array.isArray(parsed.questions) ? parsed.questions.map((question) => normalizeQuestion(question, chapterList)).filter(Boolean) : [];
      if (questions.length !== questionCount) throw new Error(`Gemini returned ${questions.length} valid questions; expected ${questionCount}.`);
      return questions;
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await delay(2 ** attempt * 1000);
    }
  }
};
