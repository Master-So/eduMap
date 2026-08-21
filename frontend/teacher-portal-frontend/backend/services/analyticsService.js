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

export async function buildTeacherAnalytics(teacherId) {
  const quizzes = await Test.find({ createdBy: teacherId }).select('title subject subjects chapters questions createdAt').lean();
  const quizIds = quizzes.map((quiz) => quiz._id);
  const submissions = quizIds.length ? await Submission.find({ testId: { $in: quizIds } }).populate('studentId', 'name email').lean() : [];
  const quizMap = new Map(quizzes.map((quiz) => [String(quiz._id), quiz]));
  const subjects = new Map();
  const chapters = new Map();
  const students = new Map();
  let totalCorrect = 0;
  let totalAnswers = 0;

  for (const submission of submissions) {
    const quiz = quizMap.get(String(submission.testId));
    if (!quiz) continue;
    const studentKey = String(submission.studentId?._id || submission.studentId || 'unknown');
    const studentBucket = students.get(studentKey) || { id: studentKey, name: submission.studentId?.name || 'Connected student', email: submission.studentId?.email || '', correct: 0, total: 0, submissions: 0 };
    studentBucket.correct += submission.score || 0;
    studentBucket.total += submission.totalQuestions || 0;
    studentBucket.submissions += 1;
    studentBucket.percentage = percent(studentBucket.correct, studentBucket.total);
    students.set(studentKey, studentBucket);

    for (const answer of submission.answers || []) {
      const question = (quiz.questions || []).find((item) => String(item._id) === String(answer.questionId));
      const chapter = answer.topicTag || question?.topicTag || quiz.chapters?.[0] || 'Unassigned chapter';
      const subject = chapterSubject.get(chapter) || quiz.subject || quiz.subjects?.[0] || 'Unassigned subject';
      const correct = answer.isCorrect ? 1 : 0;
      addBucket(subjects, subject, correct, 1);
      addBucket(chapters, chapter, correct, 1);
      totalCorrect += correct;
      totalAnswers += 1;
    }
  }

  const subjectWise = [...subjects.values()].sort((a, b) => a.percentage - b.percentage);
  const chapterWise = [...chapters.values()].sort((a, b) => a.percentage - b.percentage);
  const weakestSubject = subjectWise[0] || null;
  const weakestChapter = chapterWise[0] || null;
  return {
    generatedAt: new Date().toISOString(),
    source: submissions.length ? 'live' : 'empty',
    totals: { quizzes: quizzes.length, submissions: submissions.length, students: students.size, correct: totalCorrect, answers: totalAnswers, percentage: percent(totalCorrect, totalAnswers) },
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

export function demoTeacherAnalytics() {
  const subjectWise = [
    { name: 'Physics', correct: 85, total: 100, percentage: 85 },
    { name: 'Chemistry', correct: 72, total: 100, percentage: 72 },
    { name: 'Math', correct: 64, total: 100, percentage: 64 },
    { name: 'Computer Science', correct: 91, total: 100, percentage: 91 },
  ];
  const chapterWise = [
    { name: 'Electrostatics', correct: 40, total: 100, percentage: 40, subject: 'Physics' },
    { name: 'Current Electricity', correct: 63, total: 100, percentage: 63, subject: 'Physics' },
    { name: 'Optics', correct: 78, total: 100, percentage: 78, subject: 'Physics' },
    { name: 'Thermodynamics', correct: 82, total: 100, percentage: 82, subject: 'Physics' },
    { name: 'Chemical Reactions', correct: 72, total: 100, percentage: 72, subject: 'Chemistry' },
  ];
  return {
    generatedAt: new Date().toISOString(), source: 'demo',
    totals: { quizzes: 4, submissions: 20, students: 20, correct: 352, answers: 500, percentage: 70 },
    subjectWise, chapterWise,
    students: Array.from({ length: 20 }, (_, index) => ({ id: `demo-${index + 1}`, name: `Demo Student ${String(index + 1).padStart(2, '0')}`, email: `student${index + 1}@demo.local`, correct: 6 + (index % 5), total: 10, submissions: 1, percentage: 60 + ((index % 5) * 5) })),
    insights: { weakestSubject: 'Math is currently the weakest subject at 64%.', weakestChapter: 'Electrostatics is the weakest chapter at 40%.', recommendation: 'Create a focused Electrostatics practice quiz and revisit the core formula patterns before the next assessment.' },
  };
}
