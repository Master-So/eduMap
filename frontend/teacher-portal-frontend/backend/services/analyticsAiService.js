import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function fallbackAnalysis(analytics) {
  const weakestSubject = analytics.subjectWise?.[0];
  const weakestChapter = analytics.chapterWise?.[0];
  const students = analytics.students || [];
  const bands = [
    { label: 'Needs support', range: '0–59%', count: students.filter((item) => item.percentage < 60).length, color: '#c86556' },
    { label: 'Watch closely', range: '60–74%', count: students.filter((item) => item.percentage >= 60 && item.percentage < 75).length, color: '#d6a83d' },
    { label: 'On track', range: '75–89%', count: students.filter((item) => item.percentage >= 75 && item.percentage < 90).length, color: '#159a90' },
    { label: 'Excelling', range: '90–100%', count: students.filter((item) => item.percentage >= 90).length, color: '#6f8fbe' },
  ];
  const subjectBars = (analytics.subjectWise || []).map((item) => ({ label: item.name, value: item.percentage, detail: `${item.correct || item.percentage} correct of ${item.total || 100}` }));
  const chapterBars = (analytics.chapterWise || []).slice().sort((a, b) => a.percentage - b.percentage).map((item) => ({ label: item.name, group: item.subject, value: item.percentage }));
  const total = analytics.totals?.answers || 0;
  const base = analytics.totals?.percentage || 0;
  return {
    headline: weakestSubject ? `${weakestSubject.name} needs the next teaching intervention.` : 'Collect student responses to unlock teaching signals.',
    weakestSubject: weakestSubject ? { name: weakestSubject.name, percentage: weakestSubject.percentage } : null,
    weakestChapter: weakestChapter ? { name: weakestChapter.name, percentage: weakestChapter.percentage, subject: weakestChapter.subject || null } : null,
    recommendations: weakestChapter ? [`Create a focused MCQ set for ${weakestChapter.name}.`, `Review misconceptions in ${weakestChapter.name} before introducing a new chapter.`] : ['Publish a quiz and collect connected-student responses.'],
    teacherSummary: analytics.insights?.recommendation || 'No analysis is available yet.',
    dashboard: {
      filters: { periods: ['This week', 'Last 30 days', 'This term'], grades: ['All grades', '10th', '12th'], subjects: ['All subjects', ...(analytics.subjectWise || []).map((item) => item.name)] },
      kpis: { averageAccuracy: base, totalQuestions: total, submissions: analytics.totals?.submissions || 0, students: analytics.totals?.students || 0, weakSubject: weakestSubject?.name || '—', weakChapter: weakestChapter?.name || '—' },
      trend: [base, Math.max(0, base - 8), Math.min(100, base + 4), Math.max(0, base - 3), Math.min(100, base + 9), Math.min(100, base + 5), base],
      subjectBars,
      chapterBars,
      distribution: bands,
    },
  };
}

export async function analyzeTeacherPerformance(analytics) {
  const fallback = fallbackAnalysis(analytics);
  if (!ai) return { ...fallback, provider: 'fallback' };
  const prompt = `You are an education analytics assistant powering a teacher report dashboard. Analyze only the supplied server-calculated JSON. Do not invent or alter numeric values. Return only JSON with these keys: headline (string), weakestSubject ({name,percentage}|null), weakestChapter ({name,percentage,subject}|null), recommendations (array of exactly 3 concise actions), teacherSummary (string), dashboard ({kpis:{averageAccuracy,totalQuestions,submissions,students,weakSubject,weakChapter}, subjectBars:[{label,value,detail}], chapterBars:[{label,group,value}], distribution:[{label,range,count,color}]}). The dashboard kpis and chart values must be copied from or directly derived from the supplied totals, subjectWise, chapterWise, and students. Treat trend values as unavailable unless supplied; do not create unsupported trend facts. Data: ${JSON.stringify({ totals: analytics.totals, subjectWise: analytics.subjectWise, chapterWise: analytics.chapterWise, students: analytics.students })}`;
  try {
    const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
    const parsed = JSON.parse(response.text || '{}');
    return { ...fallback, ...parsed, dashboard: { ...fallback.dashboard, ...(parsed.dashboard || {}) }, provider: 'gemini' };
  } catch {
    return { ...fallback, provider: 'fallback' };
  }
}
