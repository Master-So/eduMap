import User from '../models/user.js';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';
import { generateStudentChatResponse } from '../services/geminiService.js';

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

function connectedTeacherIds(student) {
  return [...new Set([
    ...(student?.connectedTeachers || []).map((id) => String(id)),
    ...(student?.connectedTeacher ? [String(student.connectedTeacher)] : []),
  ])];
}


export async function connectStudentToTeacher(req, res) {
  const { teacherConnectionKey } = req.body;
  if (!teacherConnectionKey?.trim()) return res.status(400).json({ error: 'Teacher connection key is required.' });
  const teacher = await User.findOne({ role: 'teacher', connectionKey: teacherConnectionKey.trim() });
  if (!teacher) return res.status(404).json({ error: 'Teacher connection key was not found.' });
  const student = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { connectedTeachers: teacher._id }, $set: { connectedTeacher: teacher._id } },
    { new: true }
  ).select('-password');
  res.json({ message: 'Student connected successfully.', student, teacher: { id: teacher.id, name: teacher.name } });
}

export async function disconnectStudentFromTeacher(req, res) {
  const teacherId = req.params.teacherId;
  const studentBeforeUpdate = await User.findById(req.user._id).select('connectedTeacher connectedTeachers');
  if (!studentBeforeUpdate) return res.status(404).json({ error: 'Student not found.' });
  const ids = connectedTeacherIds(studentBeforeUpdate);
  const targetId = teacherId || ids[ids.length - 1];
  if (!targetId || !ids.includes(String(targetId))) return res.status(404).json({ error: 'Teacher connection not found.' });
  const update = { $pull: { connectedTeachers: targetId } };
  if (String(studentBeforeUpdate.connectedTeacher || '') === String(targetId)) update.$unset = { connectedTeacher: 1 };
  const student = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json({ message: 'Disconnected from teacher successfully.', student });
}

export async function getPublishedQuizzes(req, res) {
  const teacherIds = connectedTeacherIds(req.user);
  if (!teacherIds.length) return res.json({ quizzes: [] });
  const quizzes = await Test.find({ createdBy: { $in: teacherIds }, published: true }).sort({ publishedAt: -1 });
  const quizIds = quizzes.map((q) => q._id);
  const submissions = await Submission.find({ studentId: req.user._id, testId: { $in: quizIds } });
  const submissionMap = new Map(submissions.map((s) => [String(s.testId), s]));

  const quizList = quizzes.map((quiz) => {
    const view = studentQuizView(quiz);
    const sub = submissionMap.get(String(quiz._id));
    view.isCompleted = Boolean(sub);
    view.alreadySubmitted = Boolean(sub);
    if (sub) {
      view.submittedScore = sub.score;
      view.submittedTotal = sub.totalQuestions;
      view.submittedPercentage = sub.totalQuestions ? Math.round((sub.score / sub.totalQuestions) * 100) : 0;
      view.submittedAt = sub.createdAt;
    }
    return view;
  });

  res.json({ quizzes: quizList });
}

export async function getPublishedQuiz(req, res) {
  try {
    const teacherIds = connectedTeacherIds(req.user);
    const quiz = await Test.findOne({ _id: req.params.id, createdBy: { $in: teacherIds }, published: true });
    if (!quiz) return res.status(404).json({ error: 'Published quiz not found.' });

    const view = studentQuizView(quiz);
    if (req.user?._id) {
      const existing = await Submission.findOne({ studentId: req.user._id, testId: quiz._id });
      if (existing) {
        view.isCompleted = true;
        view.alreadySubmitted = true;
        view.submittedScore = existing.score;
        view.submittedTotal = existing.totalQuestions;
        view.submittedPercentage = existing.totalQuestions ? Math.round((existing.score / existing.totalQuestions) * 100) : 0;
        view.submittedAt = existing.createdAt;
      }
    }

    res.json({ quiz: view, test: view });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitStudentQuiz(req, res) {
  try {
    const teacherIds = connectedTeacherIds(req.user);
    const quiz = await Test.findOne({ _id: req.params.id, createdBy: { $in: teacherIds }, published: true });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    // Enforce one test attempt per student
    const existingSubmission = await Submission.findOne({ studentId: req.user._id, testId: quiz._id });
    if (existingSubmission) {
      return res.status(400).json({
        error: 'You have already completed this assessment. Each test can only be taken once.',
        alreadySubmitted: true,
        isCompleted: true,
        score: existingSubmission.score,
        totalQuestions: existingSubmission.totalQuestions,
        percentage: existingSubmission.totalQuestions ? Math.round((existingSubmission.score / existingSubmission.totalQuestions) * 100) : 0,
      });
    }

    // Link student to teacher if not linked yet
    if (!teacherIds.includes(String(quiz.createdBy))) {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { connectedTeachers: quiz.createdBy }, $set: { connectedTeacher: quiz.createdBy } });
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

export async function getQuizSubmissionResult(req, res) {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ error: 'Quiz not found.' });

    const submission = await Submission.findOne({ studentId: req.user._id, testId: test._id }).sort({ createdAt: -1 });
    if (!submission) {
      return res.status(404).json({ error: 'No submission found for this quiz.', hasSubmitted: false });
    }

    const questions = test.questions || [];
    const gradedAnswers = submission.answers || [];

    // Topic breakdown
    const topicMap = {};
    const reviewList = questions.map((q) => {
      const ans = gradedAnswers.find((a) => String(a.questionId) === String(q._id));
      const selectedIndex = ans && ans.selectedOptionIndex !== undefined ? ans.selectedOptionIndex : -1;
      const isCorrect = selectedIndex >= 0 && selectedIndex === q.correctIndex;
      const topic = q.topicTag || test.subject || 'General';

      if (!topicMap[topic]) {
        topicMap[topic] = { name: topic, correct: 0, total: 0 };
      }
      if (isCorrect) topicMap[topic].correct += 1;
      topicMap[topic].total += 1;

      return {
        questionId: q._id,
        questionText: q.questionText || q.question || 'Question',
        options: q.options || [],
        selectedIdx: selectedIndex,
        selectedText: selectedIndex >= 0 && q.options?.[selectedIndex] ? q.options[selectedIndex] : 'Not Answered',
        correctIdx: q.correctIndex,
        correctText: q.options?.[q.correctIndex] || '—',
        isCorrect,
        topic,
        difficulty: q.difficulty || 'Medium',
      };
    });

    const topicWise = Object.values(topicMap).map((t) => ({
      ...t,
      percentage: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    })).sort((a, b) => b.percentage - a.percentage);

    const score = submission.score;
    const totalQuestions = submission.totalQuestions || questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Performance Band
    let performanceBand = 'Developing';
    let bandColor = '#d6a83d';
    if (percentage >= 90) {
      performanceBand = 'Mastery';
      bandColor = '#0e8f86';
    } else if (percentage >= 75) {
      performanceBand = 'Proficient';
      bandColor = '#159a90';
    } else if (percentage >= 60) {
      performanceBand = 'Progressing';
      bandColor = '#d6a83d';
    } else {
      performanceBand = 'Needs Support';
      bandColor = '#c86556';
    }

    // AI Remedial insights for this specific test
    const aiRecommendations = [];
    const weakTopics = topicWise.filter((t) => t.percentage < 75);
    if (weakTopics.length > 0) {
      weakTopics.forEach((w, i) => {
        aiRecommendations.push({
          id: `rec_${i}`,
          topic: w.name,
          title: `Reinforce ${w.name}`,
          description: `You got ${w.correct} out of ${w.total} questions right (${w.percentage}% accuracy). Revisit definitions, examples, and practice problems in this chapter.`,
          action: `Review key formulas and notes for ${w.name}.`,
        });
      });
    } else {
      aiRecommendations.push({
        id: 'rec_excelling',
        topic: test.subject,
        title: `Outstanding Concept Mastery in ${test.subject}`,
        description: `You scored ${percentage}% on this assessment, showing robust understanding across tested chapters.`,
        action: 'Maintain momentum with next chapter quizzes.',
      });
    }

    res.json({
      test: {
        _id: test._id,
        title: test.title || `${test.subject} Quiz`,
        subject: test.subject || test.subjects?.[0] || 'General',
        grade: test.grade || '10th',
        chapters: test.chapters || [],
      },
      submission: {
        _id: submission._id,
        score,
        totalQuestions,
        percentage,
        performanceBand,
        bandColor,
        submittedAt: submission.createdAt,
      },
      topicWise,
      review: reviewList,
      aiRecommendations,
    });
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve assessment result.' });
  }
}

export async function chatWithStudentAssistant(req, res) {
  try {
    const { message, history = [], topic = 'General', grade = '10th' } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const studentName = req.user?.name || 'Student';
    const reply = await generateStudentChatResponse({
      message: String(message).trim(),
      history,
      topic,
      grade,
      studentName,
    });

    res.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error handling student chat assistant:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study assistant response.' });
  }
}


