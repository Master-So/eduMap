import User from '../models/user.js';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';

function studentQuizView(quiz) {
  const value = quiz.toObject ? quiz.toObject() : { ...quiz };
  delete value.subject;
  delete value.subjects;
  delete value.topics;
  delete value.chapters;
  delete value.createdBy;
  value.questions = (value.questions || []).map(({ correctIndex, topicTag, difficulty, ...question }) => ({ ...question, type: 'MCQ' }));
  return value;
}

export async function connectStudentToTeacher(req, res) {
  const { teacherConnectionKey } = req.body;
  if (!teacherConnectionKey?.trim()) return res.status(400).json({ error: 'Teacher connection key is required.' });
  const teacher = await User.findOne({ role: 'teacher', connectionKey: teacherConnectionKey.trim() });
  if (!teacher) return res.status(404).json({ error: 'Teacher connection key was not found.' });
  const student = await User.findByIdAndUpdate(req.user._id, { connectedTeacher: teacher._id }, { new: true }).select('-password');
  res.json({ message: 'Student connected successfully.', student, teacher: { id: teacher.id, name: teacher.name } });
}

export async function getPublishedQuizzes(req, res) {
  if (!req.user.connectedTeacher) return res.json({ quizzes: [] });
  const quizzes = await Test.find({ createdBy: req.user.connectedTeacher, published: true }).sort({ publishedAt: -1 });
  res.json({ quizzes: quizzes.map(studentQuizView) });
}

export async function getPublishedQuiz(req, res) {
  const quiz = await Test.findOne({ _id: req.params.id, createdBy: req.user.connectedTeacher, published: true });
  if (!quiz) return res.status(404).json({ error: 'Published quiz not found for this student.' });
  res.json({ quiz: studentQuizView(quiz) });
}

export async function submitStudentQuiz(req, res) {
  const quiz = await Test.findOne({ _id: req.params.id, createdBy: req.user.connectedTeacher, published: true });
  if (!quiz) return res.status(404).json({ error: 'Published quiz not found for this student.' });
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  if (!answers.length) return res.status(400).json({ error: 'At least one answer is required.' });
  const submittedIds = new Set();
  let score = 0;
  const quickAnswers = [];
  const gradedAnswers = answers.map((answer) => {
    const question = quiz.questions.id(answer.questionId);
    if (!question || submittedIds.has(String(question._id))) throw new Error(`Question ID ${answer.questionId} is invalid or duplicated.`);
    submittedIds.add(String(question._id));
    const selectedOptionIndex = Number(answer.selectedOptionIndex);
    if (!Number.isInteger(selectedOptionIndex) || selectedOptionIndex < 0 || selectedOptionIndex > 3) throw new Error('Each answer must select one of the four MCQ options.');
    const isCorrect = selectedOptionIndex === question.correctIndex;
    if (isCorrect) score += 1;
    quickAnswers.push({ questionId: question._id, selectedOptionIndex, correctOptionIndex: question.correctIndex, correctOption: question.options[question.correctIndex], isCorrect });
    return { questionId: question._id, selectedOptionIndex, isCorrect, topicTag: question.topicTag || '' };
  });
  const submission = await Submission.create({ studentId: req.user._id, testId: quiz._id, answers: gradedAnswers, score, totalQuestions: quiz.questions.length, subject: quiz.subject || quiz.subjects?.[0] || 'Unassigned subject', chapters: quiz.chapters || [] });
  const percentage = quiz.questions.length ? Math.round((score / quiz.questions.length) * 100) : 0;
  res.status(201).json({ message: 'Quiz submitted successfully.', score, percentage, totalQuestions: quiz.questions.length, submissionId: submission._id, quickAnswers });
}
