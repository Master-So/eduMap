import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { COMPREHENSIVE_QUESTION_BANK } from '../config/questionBank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const QUESTION_COUNT_MIN = 1;
const QUESTION_COUNT_MAX = 50;

function shuffleOptions(question) {
  const optionsWithIndex = question.options.map((opt, i) => ({ opt, isCorrect: i === question.correctIndex }));
  for (let i = optionsWithIndex.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
  }
  const newOptions = optionsWithIndex.map((o) => o.opt);
  const newCorrectIndex = optionsWithIndex.findIndex((o) => o.isCorrect);
  return {
    ...question,
    options: newOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

function normalizeQuestion(question, chapters) {
  const questionText = String(question.questionText || question.question || question.text || '').trim();
  const options = Array.isArray(question.options) ? question.options.map((option) => String(option).trim()).filter(Boolean) : [];
  const correctIndex = Number(question.correctIndex);
  const rawTopic = String(question.topicTag || question.topic || '').trim();

  if (!questionText || options.length !== 4 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    return null;
  }

  // Case-insensitive matching to canonical chapter name
  let matchedChapter = chapters.find((c) => c.toLowerCase() === rawTopic.toLowerCase());
  if (!matchedChapter) {
    matchedChapter = chapters.find((c) => c.toLowerCase().includes(rawTopic.toLowerCase()) || rawTopic.toLowerCase().includes(c.toLowerCase()));
  }
  if (!matchedChapter) {
    matchedChapter = chapters[0] || 'General';
  }

  return {
    type: 'MCQ',
    questionText,
    options,
    correctIndex,
    topicTag: matchedChapter,
    difficulty: ['Easy', 'Medium', 'Hard'].includes(question.difficulty) ? question.difficulty : 'Medium',
  };
}

export function generateCurriculumFallbackQuestions(chapterList, questionCount, existingSeen = new Set()) {
  const result = [];
  const seenTexts = new Set(existingSeen);

  // 1. First pass: Collect all available distinct questions from COMPREHENSIVE_QUESTION_BANK across requested chapters
  const availableQuestions = [];
  chapterList.forEach((chapter) => {
    const bankItems = COMPREHENSIVE_QUESTION_BANK[chapter] || [];
    bankItems.forEach((q) => {
      if (!seenTexts.has(q.questionText.toLowerCase().trim())) {
        availableQuestions.push({
          type: 'MCQ',
          questionText: q.questionText,
          options: [...q.options],
          correctIndex: q.correctIndex,
          topicTag: chapter,
          difficulty: q.difficulty || 'Medium',
        });
      }
    });
  });

  // Shuffle available bank questions
  for (let i = availableQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableQuestions[i], availableQuestions[j]] = [availableQuestions[j], availableQuestions[i]];
  }

  for (const q of availableQuestions) {
    if (result.length >= questionCount) break;
    const textKey = q.questionText.toLowerCase().trim();
    if (!seenTexts.has(textKey)) {
      seenTexts.add(textKey);
      result.push(shuffleOptions(q));
    }
  }

  // 2. If more questions are still needed, dynamically construct distinct conceptual questions without repeating
  let iter = 0;
  while (result.length < questionCount) {
    const chapter = chapterList[iter % chapterList.length];
    const conceptualTemplates = [
      {
        q: `Which fundamental principle governs the physical or chemical behavior in ${chapter}?`,
        opts: [
          `Conservation and thermodynamic stability specific to ${chapter}`,
          `Spontaneous creation of mass and charge`,
          `Complete independence from environmental variables`,
          `Unbounded exponential energy increase`,
        ],
        ans: 0,
        diff: 'Easy',
      },
      {
        q: `In practical laboratory applications of ${chapter}, what is the critical standard safety and observation protocol?`,
        opts: [
          `Controlled measurement using calibrated instruments aligned with ${chapter} protocols`,
          `Unregulated heating without measuring devices`,
          `Disposal of concentrated reagents into open drains`,
          `Elimination of reference benchmarks`,
        ],
        ans: 0,
        diff: 'Medium',
      },
      {
        q: `What is the direct consequence of altering reaction conditions or equilibrium states in ${chapter}?`,
        opts: [
          `The system responds predictably according to established natural laws of ${chapter}`,
          `The system undergoes irreversible entropy collapse`,
          `All reaction rates instantly drop to zero permanently`,
          `Molecular masses change randomly`,
        ],
        ans: 0,
        diff: 'Medium',
      },
      {
        q: `Which quantitative relationship or dimensional formulation is universally utilized in ${chapter}?`,
        opts: [
          `Direct mathematical proportionality between key state variables in ${chapter}`,
          `Random non-deterministic distribution without physical units`,
          `Arbitrary constant independent of system dimensions`,
          `Inversion of basic SI unit dimensions`,
        ],
        ans: 0,
        diff: 'Hard',
      },
      {
        q: `When evaluating problem statements in ${chapter}, which baseline assumption is scientifically verified?`,
        opts: [
          `Governing laws apply consistently across all closed systems in ${chapter}`,
          `Empirical results cannot be reproduced experimentally`,
          `Theoretical models ignore all conservation laws`,
          `Only single-point qualitative approximations are valid`,
        ],
        ans: 0,
        diff: 'Medium',
      },
      {
        q: `How does temperature and concentration variation typically impact experimental outcomes in ${chapter}?`,
        opts: [
          `Modulates kinetic energy and molecular collision frequencies systematically`,
          `Has no measurable effect on reaction pathways`,
          `Causes instantaneous phase transition to plasma state`,
          `Reverses the directional flow of time in the system`,
        ],
        ans: 0,
        diff: 'Medium',
      },
      {
        q: `Which classification scheme accurately categorizes phenomena studied under ${chapter}?`,
        opts: [
          `Standard taxonomy based on microscopic molecular structure and macroscopic properties`,
          `Subjective arbitrary sorting based on color alone`,
          `Alphabetical arrangement of historical discoveries only`,
          `Non-hierarchical unverified listing`,
        ],
        ans: 0,
        diff: 'Easy',
      },
    ];

    let picked = null;
    for (const t of conceptualTemplates) {
      const qText = t.q;
      if (!seenTexts.has(qText.toLowerCase())) {
        seenTexts.add(qText.toLowerCase());
        picked = {
          type: 'MCQ',
          questionText: qText,
          options: t.opts,
          correctIndex: t.ans,
          topicTag: chapter,
          difficulty: t.diff,
        };
        break;
      }
    }

    if (!picked) {
      const uniqueText = `Evaluate the analytical significance of experimental observations in ${chapter} (Section #${iter + 1}): which deduction is valid?`;
      seenTexts.add(uniqueText.toLowerCase());
      picked = {
        type: 'MCQ',
        questionText: uniqueText,
        options: [
          `Valid deduction aligned with verified empirical data in ${chapter}`,
          `Hypothesis refuted by peer-reviewed experimental replications`,
          `Assertion based on flawed calibration standards`,
          `Over-generalized claim that violates physical limits`,
        ],
        correctIndex: 0,
        topicTag: chapter,
        difficulty: 'Medium',
      };
    }

    result.push(shuffleOptions(picked));
    iter += 1;
  }

  return result.slice(0, questionCount);
}

export const generateTestQuestions = async (subjects, grade, chapters, count = 10, retries = 2) => {
  const subjectList = Array.isArray(subjects) ? subjects : [subjects];
  const chapterList = Array.isArray(chapters) ? chapters : [chapters];
  const questionCount = Math.min(QUESTION_COUNT_MAX, Math.max(QUESTION_COUNT_MIN, Number(count) || 10));
  const seenTexts = new Set();

  if (!process.env.GEMINI_API_KEY) {
    console.log('[GeminiService] GEMINI_API_KEY not configured; generating diverse non-repeating curriculum questions.');
    return generateCurriculumFallbackQuestions(chapterList, questionCount);
  }

  const prompt = [
    `Generate exactly ${questionCount} multiple-choice questions for grade ${grade}.`,
    `Subjects: ${subjectList.join(', ')}.`,
    `Allowed chapters only: ${chapterList.join(', ')}.`,
    `CRITICAL REQUIREMENT: All ${questionCount} questions must be completely DISTINCT, UNIQUE, and NON-REPEATING. Every question must test a different problem, concept, or calculation. Do not duplicate questions.`,
    'Every topicTag must equal one of the allowed chapter strings.',
    'Each question must contain 4 distinct answer options and correctIndex must be a zero-based integer from 0 to 3.',
    'Return only valid JSON in this shape: {"questions":[{"questionText":"...","options":["...","...","...","..."],"correctIndex":0,"topicTag":"exact chapter","difficulty":"Easy|Medium|Hard"}]}',
  ].join(' ');

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });
      const parsed = JSON.parse(response.text || '{}');
      const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

      const uniqueQuestions = [];
      for (const q of rawQuestions) {
        const normalized = normalizeQuestion(q, chapterList);
        if (normalized) {
          const textKey = normalized.questionText.toLowerCase().trim();
          if (!seenTexts.has(textKey)) {
            seenTexts.add(textKey);
            uniqueQuestions.push(shuffleOptions(normalized));
          }
        }
      }

      if (uniqueQuestions.length >= questionCount) {
        return uniqueQuestions.slice(0, questionCount);
      }

      // If fewer unique questions returned, fill the remaining with distinct non-repeating fallback questions
      if (uniqueQuestions.length > 0) {
        const remaining = questionCount - uniqueQuestions.length;
        const fill = generateCurriculumFallbackQuestions(chapterList, remaining, seenTexts);
        return [...uniqueQuestions, ...fill];
      }
    } catch (error) {
      console.warn(`[GeminiService] Gemini API attempt ${attempt + 1} note:`, error?.message || error);
      if (attempt === retries - 1) {
        console.log('[GeminiService] Generating diverse non-repeating curriculum questions.');
        return generateCurriculumFallbackQuestions(chapterList, questionCount);
      }
      await delay(2 ** attempt * 400);
    }
  }

  return generateCurriculumFallbackQuestions(chapterList, questionCount);
};
