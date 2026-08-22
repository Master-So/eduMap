import Submission from '../models/Submission.js';
import Test from '../models/Test.js';
import { SYLLABUS } from '../config/syllabus.js';

const percent = (correct, total) => total ? Math.round((correct / total) * 100) : 0;
const chapterSubject = new Map(Object.values(SYLLABUS).flatMap((grade) => Object.entries(grade).flatMap(([subject, chapters]) => chapters.map((chapter) => [chapter, subject]))));
const addBucket = (map, key, correct, total) => {
  const bucket = map.get(key) || { name: key, correct: 0, total: 0 };
  bucket.correct += correct;
  bucket.total += total;
  bucket.percentage = percent(bucket.correct, bucket.total);
  map.set(key, bucket);
};

function normalizeSubject(name) {
  if (!name) return 'General';
  const trimmed = String(name).trim();
  if (trimmed.toLowerCase() === 'math' || trimmed.toLowerCase() === 'mathematics') return 'Mathematics';
  return trimmed;
}

export async function buildTeacherAnalytics(teacherId) {
  const quizzes = await Test.find({ createdBy: teacherId }).select('title subject subjects chapters questions createdAt').lean();
  const quizIds = quizzes.map((quiz) => quiz._id);
  const submissions = quizIds.length ? await Submission.find({ testId: { $in: quizIds } }).populate('studentId', 'name email').sort({ createdAt: 1 }).lean() : [];
  const quizMap = new Map(quizzes.map((quiz) => [String(quiz._id), quiz]));
  const subjects = new Map();
  const chapters = new Map();
  const students = new Map();
  let totalCorrect = 0;
  let totalAnswers = 0;

  // Compute real chronological accuracy trend across submissions
  const trend = [];

  for (const submission of submissions) {
    const quiz = quizMap.get(String(submission.testId));
    if (!quiz) continue;

    const subScore = submission.score || 0;
    const subTotal = submission.totalQuestions || 0;
    if (subTotal > 0) {
      trend.push(Math.round((subScore / subTotal) * 100));
    }

    const studentKey = String(submission.studentId?._id || submission.studentId || 'unknown');
    const studentBucket = students.get(studentKey) || { id: studentKey, name: submission.studentId?.name || 'Connected student', email: submission.studentId?.email || '', correct: 0, total: 0, submissions: 0 };
    studentBucket.correct += subScore;
    studentBucket.total += subTotal;
    studentBucket.submissions += 1;
    studentBucket.percentage = percent(studentBucket.correct, studentBucket.total);
    students.set(studentKey, studentBucket);

    for (const answer of submission.answers || []) {
      const question = (quiz.questions || []).find((item) => String(item._id) === String(answer.questionId));
      const chapter = answer.topicTag || question?.topicTag || quiz.chapters?.[0] || 'Unassigned chapter';
      const rawSubject = chapterSubject.get(chapter) || quiz.subject || quiz.subjects?.[0] || 'Unassigned subject';
      const subject = normalizeSubject(rawSubject);
      const correct = answer.isCorrect ? 1 : 0;
      addBucket(subjects, subject, correct, 1);
      const chapterKey = `${subject}::${chapter}`;
      const chapterBucket = chapters.get(chapterKey) || { name: chapter, subject, correct: 0, total: 0 };
      chapterBucket.correct += correct;
      chapterBucket.total += 1;
      chapterBucket.percentage = percent(chapterBucket.correct, chapterBucket.total);
      chapters.set(chapterKey, chapterBucket);
      totalCorrect += correct;
      totalAnswers += 1;
    }
  }

  const subjectWise = [...subjects.values()].filter((item) => item.total > 0).sort((a, b) => a.percentage - b.percentage);
  const chapterWise = [...chapters.values()].filter((item) => item.total > 0).sort((a, b) => a.percentage - b.percentage);
  const weakestSubject = subjectWise[0] || null;
  const weakestChapter = chapterWise[0] || null;
  return {
    generatedAt: new Date().toISOString(),
    source: submissions.length ? 'live' : 'empty',
    totals: { quizzes: quizzes.length, submissions: submissions.length, students: students.size, correct: totalCorrect, answers: totalAnswers, percentage: percent(totalCorrect, totalAnswers) },
    trend,
    subjectWise,
    chapterWise,
    students: [...students.values()].sort((a, b) => a.percentage - b.percentage),
    insights: {
      weakestSubject: weakestSubject ? `${weakestSubject.name} needs attention at ${weakestSubject.percentage}%.` : 'No subject signal yet.',
      weakestChapter: weakestChapter ? `${weakestChapter.name} is the weakest chapter at ${weakestChapter.percentage}%.` : 'No chapter signal yet.',
      recommendation: weakestSubject && weakestChapter ? `Revisit ${weakestChapter.name} in ${weakestSubject.name} with a focused MCQ intervention.` : 'Publish a quiz and collect connected-student responses to unlock recommendations.',
    },
  };
}

