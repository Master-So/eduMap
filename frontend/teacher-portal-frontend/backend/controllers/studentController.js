import User from '../models/user.js';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';

function studentQuizView(quiz) {
  const value = quiz.toObject ? quiz.toObject() : { ...quiz };
  value.questions = (value.questions || []).map(({ correctIndex, ...question }) => ({
    ...question,
    type: 'MCQ',
    question: question.questionText || question.question,
    questionText: question.questionText || question.question,
  }));
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
  try {
    let quiz = null;
    if (req.user?.connectedTeacher) {
      quiz = await Test.findOne({ _id: req.params.id, createdBy: req.user.connectedTeacher, published: true });
    }
    if (!quiz) {
      quiz = await Test.findOne({ _id: req.params.id, published: true });
    }
    if (!quiz) {
      quiz = await Test.findById(req.params.id);
    }
    if (!quiz) return res.status(404).json({ error: 'Published quiz not found.' });
    res.json({ quiz: studentQuizView(quiz), test: studentQuizView(quiz) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitStudentQuiz(req, res) {
  try {
    let quiz = null;
    if (req.user?.connectedTeacher) {
      quiz = await Test.findOne({ _id: req.params.id, createdBy: req.user.connectedTeacher, published: true });
    }
    if (!quiz) {
      quiz = await Test.findOne({ _id: req.params.id, published: true });
    }
    if (!quiz) {
      quiz = await Test.findById(req.params.id);
    }
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    // Link student to teacher if not linked yet
    if (!req.user.connectedTeacher && quiz.createdBy) {
      await User.findByIdAndUpdate(req.user._id, { connectedTeacher: quiz.createdBy });
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    let score = 0;
    const quickAnswers = [];
    const gradedAnswers = [];

    const questions = quiz.questions || [];
    for (const question of questions) {
      const studentAnswer = answers.find((a) => String(a.questionId) === String(question._id));
      const selectedIndex = studentAnswer && studentAnswer.selectedOptionIndex !== undefined && studentAnswer.selectedOptionIndex !== null
        ? Number(studentAnswer.selectedOptionIndex)
        : -1;
      
      const isCorrect = selectedIndex >= 0 && selectedIndex === question.correctIndex;
      if (isCorrect) score += 1;

      const answeredText = selectedIndex >= 0 && question.options?.[selectedIndex]
        ? question.options[selectedIndex]
        : 'Not Answered';
      const correctText = question.options?.[question.correctIndex] || '—';

      quickAnswers.push({
        questionId: question._id,
        questionText: question.questionText || question.question || 'Question',
        selectedIdx: selectedIndex,
        selectedText: answeredText,
        correctIdx: question.correctIndex,
        correctText: correctText,
        isCorrect,
        topic: question.topicTag || quiz.subject || 'General',
      });

      gradedAnswers.push({
        questionId: question._id,
        selectedOptionIndex: selectedIndex >= 0 ? selectedIndex : 0,
        isCorrect,
        topicTag: question.topicTag || '',
      });
    }

    const totalQuestions = questions.length || 1;
    const percentage = Math.round((score / totalQuestions) * 100);

    const submission = await Submission.create({
      studentId: req.user._id,
      testId: quiz._id,
      answers: gradedAnswers,
      score,
      totalQuestions,
      subject: quiz.subject || quiz.subjects?.[0] || 'Science',
      chapters: quiz.chapters || [],
    });

    res.status(201).json({
      message: 'Quiz submitted successfully.',
      score,
      percentage,
      totalQuestions,
      submissionId: submission._id,
      quickAnswers,
      review: quickAnswers,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to submit quiz.' });
  }
}

export async function getStudentSubmissions(req, res) {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('testId', 'title subject subjects chapters grade')
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

