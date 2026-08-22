import User from '../models/user.js';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';
import { ensureConnectionKey } from '../services/connectionKeyService.js';
import { buildTeacherAnalytics } from '../services/analyticsService.js';
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
  const students = await User.find({ role: 'student', $or: [{ connectedTeachers: req.user._id }, { connectedTeacher: req.user._id }] }).select('-password').sort({ createdAt: -1 });
  res.json({ students });
}

export async function disconnectStudent(req, res) {
  const student = await User.findOneAndUpdate(
    { _id: req.params.studentId, role: 'student', $or: [{ connectedTeachers: req.user._id }, { connectedTeacher: req.user._id }] },
    { $pull: { connectedTeachers: req.user._id }, $unset: { connectedTeacher: 1 } },
    { new: true }
  ).select('-password');
  if (!student) return res.status(404).json({ error: 'Connected student not found.' });
  res.json({ message: 'Student disconnected successfully.', student });
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
  const analytics = await buildTeacherAnalytics(req.user._id);
  const aiAnalysis = await analyzeTeacherPerformance(analytics);
  res.json({ analysis: { ...analytics, source: 'live', aiReady: true, aiAnalysis, promptContext: { subjectWise: analytics.subjectWise, chapterWise: analytics.chapterWise, totals: analytics.totals } } });
}

export async function getTeacherReports(req, res) {
  try {
    const teacherId = req.user._id;
    const reports = await Submission.aggregate([
      { $lookup: { from: 'tests', localField: 'testId', foreignField: '_id', as: 'test' } },
      { $unwind: '$test' },
      { $match: { 'test.createdBy': teacherId } },
      {
        $group: {
          _id: '$testId',
          title: { $first: '$test.title' },
          subject: { $first: '$test.subject' },
          grade: { $first: '$test.grade' },
          chapters: { $first: '$test.chapters' },
          score: { $sum: '$score' },
          totalQuestions: { $sum: '$totalQuestions' },
          submissions: { $sum: 1 },
          createdAt: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          subject: 1,
          grade: 1,
          chapters: 1,
          score: 1,
          totalQuestions: 1,
          submissions: 1,
          averageScore: {
            $cond: [{ $gt: ['$submissions', 0] }, { $round: [{ $divide: ['$score', '$submissions'] }, 1] }, 0],
          },
          averageAccuracy: {
            $cond: [{ $gt: ['$totalQuestions', 0] }, { $round: [{ $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] }, 0] }, 0],
          },
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTeacherReport(req, res) {
  try {
    const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!test) return res.status(404).json({ error: 'Report not found.' });

    const submissions = await Submission.find({ testId: test._id })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    const totalSubmissions = submissions.length;
    const questionsCount = test.questions?.length || (submissions[0]?.totalQuestions ?? 5);
    const scoreSum = submissions.reduce((sum, item) => sum + (item.score || 0), 0);
    const totalPossiblePoints = submissions.reduce((sum, item) => sum + (item.totalQuestions || questionsCount), 0);
    const averageAccuracy = totalPossiblePoints > 0 ? Math.round((scoreSum / totalPossiblePoints) * 100) : 0;
    const averageScore = totalSubmissions > 0 ? (scoreSum / totalSubmissions).toFixed(1) : '0.0';

    let passCount = 0;
    let highestPct = 0;
    let lowestPct = totalSubmissions > 0 ? 100 : 0;
    let highestStudent = '—';
    let lowestStudent = '—';

    const formattedSubmissions = submissions.map((sub) => {
      const studentName = sub.studentId?.name || 'Student';
      const studentEmail = sub.studentId?.email || '';
      const sScore = sub.score || 0;
      const sTotal = sub.totalQuestions || questionsCount;
      const sPct = sTotal > 0 ? Math.round((sScore / sTotal) * 100) : 0;

      if (sPct >= 60) passCount++;
      if (sPct >= highestPct) {
        highestPct = sPct;
        highestStudent = studentName;
      }
      if (sPct <= lowestPct) {
        lowestPct = sPct;
        lowestStudent = studentName;
      }

      let band = 'Developing';
      let bandColor = '#d6a83d';
      if (sPct >= 90) {
        band = 'Mastery';
        bandColor = '#0e8f86';
      } else if (sPct >= 75) {
        band = 'Proficient';
        bandColor = '#159a90';
      } else if (sPct >= 60) {
        band = 'Developing';
        bandColor = '#d6a83d';
      } else {
        band = 'Needs Support';
        bandColor = '#c86556';
      }

      return {
        _id: sub._id,
        studentId: sub.studentId?._id || sub.studentId,
        studentName,
        studentEmail,
        score: sScore,
        totalQuestions: sTotal,
        percentage: sPct,
        performanceBand: band,
        bandColor,
        submittedAt: sub.createdAt,
        answers: sub.answers || [],
      };
    });

    const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

    // Topic Breakdown
    const topicMap = {};
    for (const sub of submissions) {
      for (const ans of sub.answers || []) {
        const q = (test.questions || []).find((item) => String(item._id) === String(ans.questionId));
        const topic = ans.topicTag || q?.topicTag || test.subject || 'General Concept';
        if (!topicMap[topic]) {
          topicMap[topic] = { name: topic, correct: 0, total: 0 };
        }
        if (ans.isCorrect) topicMap[topic].correct += 1;
        topicMap[topic].total += 1;
      }
    }

    const topicBreakdown = Object.values(topicMap).map((t) => ({
      ...t,
      percentage: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    })).sort((a, b) => a.percentage - b.percentage);

    // Question-by-Question Analysis
    const questionAnalysis = (test.questions || []).map((q, idx) => {
      let correctCount = 0;
      let totalAnswered = 0;
      const optionCounts = (q.options || []).map(() => 0);

      for (const sub of submissions) {
        const ans = (sub.answers || []).find((a) => String(a.questionId) === String(q._id));
        if (ans) {
          totalAnswered += 1;
          if (ans.isCorrect) correctCount += 1;
          if (ans.selectedOptionIndex >= 0 && ans.selectedOptionIndex < optionCounts.length) {
            optionCounts[ans.selectedOptionIndex] += 1;
          }
        }
      }

      const qAccuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      return {
        questionId: q._id,
        index: idx + 1,
        questionText: q.questionText || q.question || `Question ${idx + 1}`,
        options: q.options || [],
        correctIndex: q.correctIndex,
        correctText: q.options?.[q.correctIndex] || '—',
        topicTag: q.topicTag || test.subject || 'General',
        difficulty: q.difficulty || 'Medium',
        totalAnswered,
        correctCount,
        accuracy: qAccuracy,
        optionCounts,
      };
    });

    // AI Recommendations
    const aiRecommendations = [];
    const weakTopics = topicBreakdown.filter((t) => t.percentage < 75);
    if (weakTopics.length > 0) {
      weakTopics.forEach((w, i) => {
        aiRecommendations.push({
          id: `rec_${i}`,
          title: `Intervention Recommended: ${w.name}`,
          description: `Class accuracy on ${w.name} is ${w.percentage}% (${w.correct}/${w.total} correct answers). Revisit definitions, examples, and targeted practice problems in this chapter.`,
          action: `Conduct a targeted review session on ${w.name}.`,
        });
      });
    } else if (totalSubmissions > 0) {
      aiRecommendations.push({
        id: 'rec_high',
        title: `Consistent Mastery across ${test.subject}`,
        description: `Your students maintained high average accuracy (${averageAccuracy}%) across this assessment.`,
        action: 'Advance to higher-order problem sets or next syllabus unit.',
      });
    }

    const summary = totalSubmissions > 0
      ? `Based on ${totalSubmissions} student submission(s), the class achieved an average accuracy of ${averageAccuracy}% (average score ${averageScore} / ${questionsCount}). Overall pass rate is ${passRate}%.`
      : 'No student submissions recorded for this quiz yet.';

    res.json({
      report: {
        id: test._id,
        _id: test._id,
        title: test.title || `${test.subject} Assessment Report`,
        subject: test.subject || test.subjects?.[0] || 'General',
        grade: test.grade || '10th',
        chapters: test.chapters || [],
        createdAt: test.createdAt,
        publishedAt: test.publishedAt,
        summary,
        stats: {
          submissionsCount: totalSubmissions,
          averageAccuracy,
          averageScore: Number(averageScore),
          totalQuestions: questionsCount,
          highestPercentage: highestPct,
          lowestPercentage: lowestPct,
          highestStudent,
          lowestStudent,
          passRate,
        },
        topicBreakdown,
        questionAnalysis,
        submissions: formattedSubmissions,
        aiRecommendations,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function publishQuiz(req, res) {
  const quiz = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
  quiz.published = true;
  quiz.publishedAt = new Date();
  await quiz.save();
  res.json({ message: 'Quiz published successfully.', quiz });
}
