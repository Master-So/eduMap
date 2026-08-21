import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  KeyRound,
  Layers,
  Lightbulb,
  Lock,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Unlock,
  UsersRound
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { studentApi, getStudentUser, setStudentUser, getAuthToken, submissionStorage } from '../services/api';

export default function StudentAnalyticsPage() {
  const [student, setStudent] = useState(getStudentUser());
  const token = getAuthToken();

  // Connection Key Form State
  const [teacherKey, setTeacherKey] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState('');

  // Quizzes and Dynamic Analytics Data State
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isConnected = Boolean(student?.connectedTeacher);

  // Load Real Quizzes and Compute Real Dynamic Analytics
  const loadData = async () => {
    setRefreshing(true);

    try {
      // 1. Fetch published quizzes from server if connected
      if (token && isConnected) {
        setQuizzesLoading(true);
        try {
          const quizRes = await studentApi.getPublishedQuizzes();
          if (quizRes?.quizzes) {
            setQuizzes(quizRes.quizzes);
          }
        } catch (quizErr) {
          console.warn('Could not fetch remote quizzes:', quizErr.message);
        } finally {
          setQuizzesLoading(false);
        }
      }

      // 2. Load Real Dynamic Submissions from Storage & Compute Metrics
      const studentId = student?._id || 'guest';
      const realSubmissions = submissionStorage.getSubmissions(studentId);
      const computed = submissionStorage.calculateAnalytics(realSubmissions);
      setAnalyticsData(computed);
    } catch (err) {
      console.warn('Analytics compute note:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [student?.connectedTeacher, student?._id]);

  // Handle Teacher Connection Key Submission
  const handleConnectTeacher = async (e) => {
    e.preventDefault();
    if (!teacherKey.trim()) {
      setConnectError('Please enter a valid teacher connection key.');
      return;
    }

    setConnecting(true);
    setConnectError('');
    setConnectSuccess('');

    try {
      const response = await studentApi.connectToTeacher(teacherKey.trim());
      const updatedStudent = {
        ...student,
        connectedTeacher: response.teacher?.id || response.student?.connectedTeacher || true,
        teacherName: response.teacher?.name || 'Instructor',
      };
      setStudentUser(updatedStudent);
      setStudent(updatedStudent);
      setConnectSuccess(`Successfully connected with ${response.teacher?.name || 'teacher'}! Quizzes are now unlocked.`);
      setTeacherKey('');
    } catch (err) {
      setConnectError(err.message || 'Teacher connection key was not found. Please verify the key with your teacher.');
    } finally {
      setConnecting(false);
    }
  };

  // Dynamic SVG Trend Chart Component
  const TrendChart = ({ values = [] }) => {
    if (!values || values.length === 0) {
      return (
        <div className="state-card" style={{ height: '14rem', padding: '1rem' }}>
          <TrendingUp size={24} color="var(--moss)" />
          <h3 style={{ fontSize: '0.85rem' }}>No Assessment Data</h3>
          <p style={{ fontSize: '0.74rem' }}>
            Complete your first test to plot your performance trajectory.
          </p>
        </div>
      );
    }

    // When there's only 1 test, display single point baseline
    const points = values.length === 1 ? [values[0], values[0]] : values;
    const max = 100;
    const min = 0;
    const range = 100;
    const coords = points.map((val, idx) => `${(idx / (points.length - 1)) * 100},${100 - ((val - min) / range) * 80 - 10}`).join(' ');
    const area = `0,100 ${coords} 100,100`;

    return (
      <div className="reference-chart">
        <div className="chart-y-axis">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Accuracy trend">
          <defs>
            <linearGradient id="studentTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0e8f86" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0e8f86" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#studentTrendFill)" />
          <polyline points={coords} fill="none" stroke="#0e8f86" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="chart-x-axis">
          {values.map((_, idx) => (
            <span key={idx}>Test {idx + 1}</span>
          ))}
        </div>
      </div>
    );
  };

  const hasSubmissions = analyticsData?.hasData && analyticsData?.quizzesCompleted > 0;

  return (
    <div className="page-stack">
      {/* Editorial Page Header */}
      <PageHeader
        eyebrow="Student analytics"
        title="Personal performance & quizzes."
        description="Track your mastery trajectory, connect with your teacher's key to unlock published assessments, and explore real-time AI recommendations."
        action={
          <button className="button secondary small" onClick={loadData} title="Refresh telemetry">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        }
      />

      {/* ---------------------------------------------------- */}
      {/* TEACHER CONNECTION KEY GATING SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="connection-card">
        <div className="connection-icon">
          <KeyRound size={22} />
        </div>
        <div className="connection-copy" style={{ width: '100%' }}>
          <span className="eyebrow" style={{ color: 'var(--teal)' }}>
            {isConnected ? 'Verified Connection' : 'Teacher Key Required'}
          </span>
          <h2>
            {isConnected
              ? 'Your classroom connection is active.'
              : 'Connect with your teacher key to unlock quizzes.'}
          </h2>
          <p>
            {isConnected
              ? `You are connected with your teacher (${student?.teacherName || 'Instructor'}). All published curriculum quizzes are available below.`
              : 'Students can only take live assessments once linked to a teacher via their unique connection key.'}
          </p>

          {/* Key Form / Status */}
          {!isConnected ? (
            <form onSubmit={handleConnectTeacher} className="key-row">
              <input
                type="text"
                value={teacherKey}
                onChange={(e) => setTeacherKey(e.target.value)}
                placeholder="Enter Teacher Connection Key (e.g. TCH-9876)"
                className="key-input"
                disabled={connecting}
              />
              <button
                type="submit"
                className="button primary"
                disabled={connecting || !teacherKey.trim()}
              >
                {connecting ? 'Validating Key...' : 'Connect to Teacher'}
              </button>
            </form>
          ) : (
            <div className="key-row">
              <span className="key-badge">
                STATUS: UNLOCKED & CONNECTED
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--moss)' }}>
                Teacher access key is active.
              </span>
            </div>
          )}

          {connectError && (
            <div className="form-error" style={{ marginTop: '0.8rem' }}>
              <CircleAlert size={16} />
              <span>{connectError}</span>
            </div>
          )}

          {connectSuccess && (
            <div className="form-success" style={{ marginTop: '0.8rem' }}>
              <CheckCircle2 size={16} />
              <span>{connectSuccess}</span>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4 DYNAMIC STAT METRICS (UPDATES BASED ON TESTS TAKEN) */}
      {/* ---------------------------------------------------- */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">
            <Target size={14} /> Overall Accuracy
          </span>
          <strong>
            {hasSubmissions ? `${analyticsData.overallAccuracy}%` : '--'}
          </strong>
          <p>
            {hasSubmissions
              ? 'Calculated across all graded submissions'
              : 'Take a quiz to compute accuracy'}
          </p>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            <BookOpen size={14} /> Quizzes Completed
          </span>
          <strong>{analyticsData?.quizzesCompleted ?? 0}</strong>
          <p>
            {hasSubmissions
              ? `${analyticsData.quizzesCompleted} assessment(s) recorded`
              : 'No assessments submitted yet'}
          </p>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            <Sparkles size={14} /> Strongest Subject
          </span>
          <strong style={{ fontSize: '1.45rem', paddingTop: '0.6rem', lineHeight: 1.2 }}>
            {hasSubmissions ? analyticsData.strongestSubject : 'Pending'}
          </strong>
          <p>
            {hasSubmissions
              ? 'Highest recorded subject performance'
              : 'Awaiting first test submission'}
          </p>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            <CircleAlert size={14} /> Critical Focus
          </span>
          <strong style={{ fontSize: '1.45rem', paddingTop: '0.6rem', color: hasSubmissions ? 'var(--destructive)' : 'var(--ink)', lineHeight: 1.2 }}>
            {hasSubmissions ? analyticsData.weakestTopic : 'Pending'}
          </strong>
          <p>
            {hasSubmissions
              ? 'Lowest scoring topic detected'
              : 'No weak areas identified yet'}
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PUBLISHED QUIZZES PANEL (LOCKED IF NO KEY) */}
      {/* ---------------------------------------------------- */}
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Assessment Roster</span>
            <h2>Available Published Quizzes</h2>
          </div>
          <span className="panel-index">
            {isConnected ? `${quizzes.length} Quizzes Unlocked` : 'Locked'}
          </span>
        </div>

        {!isConnected ? (
          <div className="state-card" style={{ padding: '3rem 1.5rem' }}>
            <div className="state-mark" style={{ borderColor: '#d1dbd6', color: 'var(--moss)' }}>
              <Lock size={20} />
            </div>
            <h3>Quizzes Locked</h3>
            <p>
              Please enter your teacher's connection key above to unlock and take published assessments.
            </p>
          </div>
        ) : quizzesLoading ? (
          <div className="state-card">
            <span className="spinner" />
            <p>Fetching quizzes from connected teacher...</p>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Subject</th>
                  <th>Questions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id || quiz.id}>
                    <td>
                      <strong style={{ fontSize: '0.84rem' }}>
                        {quiz.title || `${quiz.grade || 'Curriculum'} Quiz`}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--teal)', fontWeight: 700 }}>
                        {quiz.subject || quiz.subjects?.[0] || 'General'}
                      </span>
                    </td>
                    <td>{quiz.questions?.length || 5} Questions</td>
                    <td>
                      <Link
                        to={`/test/${quiz._id || quiz.id}`}
                        className="button primary small"
                      >
                        <Play size={12} />
                        <span>Start Quiz</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-card" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="state-mark">
              <BookOpen size={20} />
            </div>
            <h3>No Published Quizzes Yet</h3>
            <p>
              Your connected teacher has not published any active quizzes at this moment. You can try a practice test below:
            </p>
            <Link to="/test/physics-practice-101" className="button secondary small" style={{ marginTop: '0.5rem' }}>
              <Play size={12} /> Take Practice Physics Assessment
            </Link>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2-COLUMN ANALYTICS: ACCURACY TREND + SUBJECT MASTERY */}
      {/* ---------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)', gap: '1rem' }}>
        {/* Panel 1: Accuracy Progression Trend */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Performance Progression</span>
              <h2>Score Trend Across Quizzes</h2>
            </div>
          </div>
          <TrendChart values={analyticsData?.trendPoints} />
        </div>

        {/* Panel 2: Subject Mastery Progress Bars */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Curriculum Mastery</span>
              <h2>Subject Accuracy</h2>
            </div>
          </div>

          {hasSubmissions && analyticsData?.subjectWise?.length > 0 ? (
            <div className="analytics-bars" style={{ marginTop: '1rem' }}>
              {analyticsData.subjectWise.map((subject) => (
                <div key={subject.name} className="analytics-bar">
                  <div className="analytics-bar-label">
                    <span>{subject.name} ({subject.correct}/{subject.total} correct)</span>
                    <b>{subject.percentage}%</b>
                  </div>
                  <div className="analytics-bar-track">
                    <span style={{ width: `${subject.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="state-card" style={{ height: '14rem', padding: '1rem' }}>
              <BookOpen size={24} color="var(--moss)" />
              <h3 style={{ fontSize: '0.85rem' }}>No Subject Data</h3>
              <p style={{ fontSize: '0.74rem' }}>
                Subject breakdown will compute automatically as tests are submitted.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* AI STRATEGIC PEDAGOGICAL INSIGHTS (DYNAMIC FROM TESTS) */}
      {/* ---------------------------------------------------- */}
      <section className="panel" style={{ background: '#fff' }}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">AI Learning Insights</span>
            <h2>Personalized Remedial Actions</h2>
          </div>
          <BrainCircuit size={20} color="var(--teal)" />
        </div>

        {analyticsData?.aiRecommendations?.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {analyticsData.aiRecommendations.map((rec) => (
              <div key={rec.id} className="recommendation">
                <Lightbulb size={18} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.84rem', marginBottom: '0.2rem' }}>
                    {rec.title}
                  </strong>
                  <p style={{ margin: '0 0 0.4rem', color: 'var(--moss)', fontSize: '0.78rem' }}>
                    {rec.description}
                  </p>
                  <span style={{ fontSize: '0.74rem', color: 'var(--teal)', fontWeight: 800 }}>
                    Suggested Action: {rec.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="state-card" style={{ padding: '2rem 1rem' }}>
            <Sparkles size={24} color="var(--teal)" />
            <h3 style={{ fontSize: '0.85rem' }}>Awaiting Assessment Data</h3>
            <p style={{ fontSize: '0.74rem', maxWidth: '380px' }}>
              AI insights and remedial recommendations are dynamically generated once you complete your first quiz.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
