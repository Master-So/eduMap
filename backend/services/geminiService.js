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

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'].filter(Boolean);

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const currentModel = candidateModels[attempt % candidateModels.length] || 'gemini-3.5-flash';
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ model: currentModel, contents: prompt, config: { responseMimeType: 'application/json' } });
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

export async function generateStudentChatResponse({ message, history = [], topic = 'General', grade = '10th', studentName = 'Student' }) {
  if (!message) return 'Hi! How can I help you with your studies today?';

  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackTutorResponse(message, topic);
  }

  const systemInstructions = [
    `You are "EduAI Tutor", an encouraging, patient, and brilliant academic study assistant on the EduMap platform.`,
    `You are helping a ${grade} student named ${studentName}. Current focus topic: ${topic}.`,
    `Your goals:`,
    `1. Answer questions clearly, accurately, and conceptually based on curriculum standard syllabi (NCERT/CBSE/State Board).`,
    `2. If the student is asking for a formula or concept (like Pythagoras theorem, Ohm's Law, Optics, Photosynthesis, Quadratic Equations), explain the intuition, state the formula clearly, and give a quick real-world example.`,
    `3. If the student has doubts about a quiz question or their weak topics, break it down step-by-step with tips.`,
    `4. Keep explanations concise, structured (using bullet points and bold text), and easy to scan.`,
    `5. Always maintain a warm, motivating, and supportive tone.`,
    `6. CRITICAL FORMATTING RULE: Do NOT use LaTeX dollar signs like $a$, $b$, $a^2$, $$...$$, or \\( ... \\). Write all mathematical equations, variables, and units using clean readable Unicode symbols and superscripts/subscripts (for example: a² + b² = c², V = I × R, CO₂, H₂O, √x, ±, ×, ÷, °). Never enclose regular single variables in dollar signs.`,
  ].join('\n');

  // Format past history for context
  const formattedHistory = (history || []).slice(-6).map((h) => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.text || h.message || '' }],
  }));

  const contents = [
    ...formattedHistory,
    {
      role: 'user',
      parts: [{ text: `${systemInstructions}\n\nStudent asks: "${message}"` }],
    },
  ];

  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
  ].filter(Boolean);

  for (const model of candidateModels) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model,
        contents,
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn(`[GeminiChat] Model ${model} returned:`, err.message);
    }
  }

  return generateFallbackTutorResponse(message, topic);
}

function generateFallbackTutorResponse(msg, topic) {
  const lower = msg.toLowerCase();

  if (lower.includes('formula') || lower.includes('equation')) {
    return `### 📐 Core Formulas for ${topic}\n\n- **Ohm's Law:** \\( V = I \\times R \\) (Voltage = Current × Resistance)\n- **Kinetic Energy:** \\( KE = \\frac{1}{2} m v^2 \\)\n- **Quadratic Formula:** \\( x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\)\n- **Mirror Equation:** \\( \\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u} \\)\n\n*Tip: Always remember to convert units into SI standard before plugging into numerical formulas!*`;
  }

  if (lower.includes('light') || lower.includes('reflection') || lower.includes('refraction')) {
    return `### 💡 Optics Essentials\n\n1. **Law of Reflection:** Angle of incidence \\( (\\angle i) \\) equals Angle of reflection \\( (\\angle r) \\).\n2. **Refractive Index \\( (n) \\):** \\( n = \\frac{c}{v} \\) (Speed of light in vacuum / Speed in medium).\n3. **Concave Mirror:** Forms real & inverted images in most cases, but virtual & enlarged when object is between Pole and Focus.\n4. **Convex Mirror:** Always produces virtual, erect, and diminished images (used in vehicle rear-view mirrors).\n\nWould you like a sample practice question on lens power or focal length?`;
  }

  if (lower.includes('electricity') || lower.includes('current') || lower.includes('circuit')) {
    return `### ⚡ Electricity Breakdown\n\n- **Electric Current \\( (I) \\):** \\( I = \\frac{Q}{t} \\) (Amperes)\n- **Resistance Factors:** \\( R = \\rho \\frac{l}{A} \\) (Directly proportional to length, inversely to cross-section area)\n- **Series vs Parallel:**\n  - Series: \\( R_{eq} = R_1 + R_2 + ... \\) (Same current flows through each resistor)\n  - Parallel: \\( \\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} \\) (Same voltage across branches)\n\nNeed help solving a specific circuit diagram or numerical problem?`;
  }

  if (lower.includes('life processes') || lower.includes('biology') || lower.includes('cell')) {
    return `### 🌿 Life Processes Quick Revision\n\n- **Photosynthesis:** \\( 6CO_2 + 6H_2O \\xrightarrow{\\text{Light, Chlorophyll}} C_6H_{12}O_6 + 6O_2 \\)\n- **Respiration:** Breakdown of glucose via Glycolysis (in cytoplasm) followed by aerobic Krebs cycle in Mitochondria producing 38 ATP.\n- **Human Circulatory System:** Double circulation prevents mixing of oxygenated (left heart) and deoxygenated (right heart) blood.\n- **Nephron:** Functional filtration unit of the kidney responsible for ultrafiltration and selective reabsorption.`;
  }

  return `### 🎓 EduAI Study Helper\n\nI'm ready to help you master **${topic}**! You can ask me:\n\n- *"Explain Newton's Laws of Motion with real examples"*\n- *"What is the difference between combination and decomposition reactions?"*\n- *"Give me a 3-step revision plan for my upcoming exam"*\n- *"Solve: An object is placed at 20 cm in front of a concave lens of focal length 15 cm..."*\n\nWhat topic would you like to explore?`;
}
