import User from '../models/user.js';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';
import { ensureConnectionKey } from '../services/connectionKeyService.js';
import { buildTeacherAnalytics, demoTeacherAnalytics } from '../services/analyticsService.js';
import { analyzeTeacherPerformance } from '../services/analyticsAiService.js';

export async function getTeacherProfile(req, res) {
  const teacher = await User.findById(req.user._id).select('-password');
  res.json({ teacher });
}

export async function getConnectionKey(req, res) {
  const teacher = await User.findById(req.user._id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found.' });
  await ensureConnectionKey(teacher);
  res.json({ connectionKey: teacher.connectionKey, teacherConnectionKey: teacher.connectionKey });
}

export async function getConnectedStudents(req, res) {
  const students = await User.find({ role: 'student', connectedTeacher: req.user._id }).select('-password').sort({ createdAt: -1 });
  res.json({ students });
}

export async function getTeacherQuizzes(req, res) {
  const quizzes = await Test.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ quizzes });
}

export async function getTeacherAnalytics(req, res) {
  const analytics = await buildTeacherAnalytics(req.user._id);
  res.json({ analytics });
}

export async function analyzeTeacherAnalytics(req, res) {
  const liveAnalytics = await buildTeacherAnalytics(req.user._id);
  const analytics = liveAnalytics.source === 'empty' ? demoTeacherAnalytics() : liveAnalytics;
  const aiAnalysis = await analyzeTeacherPerformance(analytics);
  res.json({ analysis: { ...analytics, source: liveAnalytics.source === 'empty' ? 'demo' : 'live', aiReady: true, aiAnalysis, promptContext: { subjectWise: analytics.subjectWise, chapterWise: analytics.chapterWise, totals: analytics.totals } } });
}

export async function getTeacherReports(req, res) {
  const reports = await Submission.aggregate([
    { $lookup: { from: 'tests', localField: 'testId', foreignField: '_id', as: 'test' } },
    { $unwind: '$test' },
    { $match: { 'test.createdBy': req.user._id } },
    { $group: { _id: '$testId', title: { $first: '$test.title' }, subject: { $first: '$test.subject' }, score: { $sum: '$score' }, totalQuestions: { $sum: '$totalQuestions' }, submissions: { $sum: 1 }, createdAt: { $max: '$createdAt' } } },
    { $sort: { createdAt: -1 } },
  ]);
  res.json({ reports });
}

export async function getTeacherReport(req, res) {
  const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!test) return res.status(404).json({ error: 'Report not found.' });
  const submissions = await Submission.find({ testId: test._id }).populate('studentId', 'name email').sort({ createdAt: -1 });
  const score = submissions.reduce((sum, item) => sum + item.score, 0);
  const total = submissions.reduce((sum, item) => sum + item.totalQuestions, 0);
  res.json({ report: { id: test._id, title: test.title || `${test.subject} report`, summary: submissions.length ? `Based on ${submissions.length} submission(s), the recorded score is ${score} out of ${total}.` : 'No submissions are available for this quiz yet.', submissions } });
}

export async function publishQuiz(req, res) {
  const quiz = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
  quiz.published = true;
  quiz.publishedAt = new Date();
  await quiz.save();
  res.json({ message: 'Quiz published successfully.', quiz });
}
