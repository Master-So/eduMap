import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function fallbackAnalysis(analytics) {
  const hasSubmissions = (analytics?.totals?.submissions || 0) > 0;
  const weakestSubject = analytics.subjectWise?.[0];
  const weakestChapter = analytics.chapterWise?.[0];
  const students = analytics.students || [];
  const bands = [
    { label: 'Needs support', range: '0–59%', count: students.filter((item) => item.percentage < 60).length, color: '#c86556' },
    { label: 'Watch closely', range: '60–74%', count: students.filter((item) => item.percentage >= 60 && item.percentage < 75).length, color: '#d6a83d' },
    { label: 'On track', range: '75–89%', count: students.filter((item) => item.percentage >= 75 && item.percentage < 90).length, color: '#159a90' },
    { label: 'Excelling', range: '90–100%', count: students.filter((item) => item.percentage >= 90).length, color: '#6f8fbe' },
  ];
  const subjectBars = (analytics.subjectWise || []).map((item) => ({
    label: item.name,
    value: item.percentage,
    detail: `${item.correct || 0} of ${item.total || 0} correct`,
  }));
  const chapterBars = (analytics.chapterWise || []).slice().sort((a, b) => a.percentage - b.percentage).map((item) => ({
    label: item.name,
    group: item.subject,
    value: item.percentage,
  }));
  const total = analytics.totals?.answers || 0;
  const base = analytics.totals?.percentage || 0;
  const realTrend = Array.isArray(analytics.trend) ? analytics.trend : [];

  return {
    headline: hasSubmissions
      ? (weakestSubject ? `${weakestSubject.name} needs the next teaching intervention.` : 'Class performance overview is ready.')
      : 'Collect student responses to unlock teaching signals.',
    weakestSubject: weakestSubject ? { name: weakestSubject.name, percentage: weakestSubject.percentage } : null,
    weakestChapter: weakestChapter ? { name: weakestChapter.name, percentage: weakestChapter.percentage, subject: weakestChapter.subject || null } : null,
    recommendations: hasSubmissions && weakestChapter
      ? [`Create a focused MCQ set for ${weakestChapter.name}.`, `Review misconceptions in ${weakestChapter.name} before introducing a new chapter.`, `Provide remedial practice on ${weakestSubject?.name || 'core concepts'}.`]
      : ['Share your teacher connection key with students in the Students tab.', 'Create and publish curriculum quizzes from the Create Quiz tab.', 'Student submissions will automatically generate live AI insights and topic heatmaps.'],
    teacherSummary: hasSubmissions
      ? (analytics.insights?.recommendation || 'Real classroom performance signal is ready for review.')
      : 'No student submissions recorded yet. Once your connected students submit quizzes, real performance metrics and Gemini analysis will appear here.',
    dashboard: {
      filters: { periods: ['This week', 'Last 30 days', 'This term'], grades: ['All grades', '10th', '12th'], subjects: ['All subjects', ...(analytics.subjectWise || []).map((item) => item.name)] },
      kpis: {
        averageAccuracy: base,
        totalQuestions: total,
        submissions: analytics.totals?.submissions || 0,
        students: analytics.totals?.connectedStudents ?? analytics.totals?.students ?? 0,
        weakSubject: weakestSubject?.name || '—',
        weakChapter: weakestChapter?.name || '—',
      },
      trend: realTrend,
      subjectBars,
      chapterBars,
      distribution: bands,
    },
  };
}

function sanitizeNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : Math.round(val);
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? fallback : Math.round(num);
}

export async function analyzeTeacherPerformance(analytics) {
  const fallback = fallbackAnalysis(analytics);
  if (!analytics.totals?.submissions || analytics.totals.submissions === 0 || !ai) {
    return { ...fallback, provider: 'fallback' };
  }
  const prompt = `You are an education analytics assistant powering a teacher report dashboard. Analyze only the supplied server-calculated JSON. Do not invent numeric values or create phantom subjects. Return only JSON with these keys: headline (string summarizing class standing), recommendations (array of exactly 3 concise actionable pedagogy steps), teacherSummary (string summarizing teacher priorities). Data: ${JSON.stringify({ totals: analytics.totals, subjectWise: analytics.subjectWise, chapterWise: analytics.chapterWise, students: analytics.students, trend: analytics.trend })}`;
  try {
    const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
    const parsed = JSON.parse(response.text || '{}');

    return {
      ...fallback,
      headline: parsed.headline || fallback.headline,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length ? parsed.recommendations.slice(0, 3) : fallback.recommendations,
      teacherSummary: parsed.teacherSummary || fallback.teacherSummary,
      provider: 'gemini',
    };
  } catch {
    return { ...fallback, provider: 'fallback' };
  }
}
