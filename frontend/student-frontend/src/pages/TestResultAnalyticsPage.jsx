import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { studentApi, getStudentUser, submissionStorage } from '../services/api';
import confetti from 'canvas-confetti';

export default function TestResultAnalyticsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const student = getStudentUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'correct', 'incorrect'

  useEffect(() => {
    async function fetchResult() {
      setLoading(true);
      setError('');
      try {
        const response = await studentApi.getQuizResult(testId);
        if (response && response.submission) {
          setResultData(response);
          // Trigger subtle celebration if good score
          if (response.submission.percentage >= 70) {
            try {
              confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#0e8f86', '#159a90', '#20404a', '#84a56c'],
              });
            } catch (e) {}
          }
        } else {
          setError('No recorded submission found for this quiz.');
        }
      } catch (err) {
        console.warn('API getQuizResult note:', err?.message || err);
        // Check fallback from local storage
        const localSubs = submissionStorage.getSubmissions(student?._id || 'guest');
        const matched = localSubs.find((s) => s.testId === testId || s.id === testId);
        if (matched) {
          const score = matched.score || 0;
          const totalQuestions = matched.total || matched.totalQuestions || 5;
          const percentage = matched.percentage !== undefined ? matched.percentage : Math.round((score / totalQuestions) * 100);
          setResultData({
            test: {
              _id: testId,
              title: matched.title || 'Curriculum Quiz',
              subject: matched.subject || 'General',
              grade: 'Classroom',
              chapters: [],
            },
            submission: {
              score,
              totalQuestions,
              percentage,
              performanceBand: percentage >= 90 ? 'Mastery' : percentage >= 75 ? 'Proficient' : percentage >= 60 ? 'Progressing' : 'Needs Support',
              bandColor: percentage >= 90 ? '#0e8f86' : percentage >= 75 ? '#159a90' : percentage >= 60 ? '#d6a83d' : '#c86556',
              submittedAt: matched.submittedAt || new Date().toISOString(),
            },
            topicWise: [],
            review: matched.review || matched.answers || [],
            aiRecommendations: [
              {
                id: 'local_rec',
                title: 'Review Missed Questions',
                description: 'Analyze the detailed answer breakdown below to reinforce core concepts before the next quiz.',
                action: 'Practice key formulas and definitions.',
              }
            ],
          });
        } else {
          setError(err.message || 'Unable to retrieve test result analytics.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (testId) {
      fetchResult();
    }
  }, [testId]);

  const test = resultData?.test;
  const sub = resultData?.submission;
  const topicWise = resultData?.topicWise || [];
  const review = resultData?.review || [];
  const recommendations = resultData?.aiRecommendations || [];

  const filteredReview = useMemo(() => {
    if (filterMode === 'correct') return review.filter((r) => r.isCorrect);
    if (filterMode === 'incorrect') return review.filter((r) => !r.isCorrect);
    return review;
  }, [review, filterMode]);

  const correctCount = review.filter((r) => r.isCorrect).length;
  const incorrectCount = review.filter((r) => !r.isCorrect).length;

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Assessment Diagnostics"
          title="Loading Post-Test Analytics..."
          description="Synthesizing submission telemetry and AI remedial insights."
        />
        <div className="state-card" style={{ padding: '4rem 1.5rem' }}>
          <span className="spinner" />
          <p style={{ marginTop: '1rem' }}>Compiling performance analytics and item analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Assessment Diagnostics"
          title="Submission Not Found"
          description="We could not locate a recorded submission for this assessment."
          action={
            <Link to="/analytics" className="button primary small">
              <ArrowLeft size={14} /> Return to Analytics
            </Link>
          }
        />
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: '640px', margin: '0 auto' }}>
          <HelpCircle size={40} color="var(--destructive)" style={{ marginBottom: '1rem' }} />
          <h2>No Submission Record</h2>
          <p style={{ color: 'var(--moss)', marginBottom: '1.5rem' }}>
            {error || 'You have not submitted this test yet or the test ID is invalid.'}
          </p>
          <Link to="/analytics" className="button primary">
            <BarChart3 size={15} /> Go to Analytics Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      {/* ---------------------------------------------------- */}
      {/* HEADER WITH CONTEXT & ACTIONS */}
      {/* ---------------------------------------------------- */}
      <PageHeader
        eyebrow="Post-Assessment Telemetry & Diagnostics"
        title="Test Submission Analytics"
        description={`Comprehensive performance score, topic mastery breakdown, and AI remedial actions for ${test?.title || 'Assessment'}.`}
        action={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to="/analytics" className="button secondary small">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
        }
      />

      {/* ---------------------------------------------------- */}
      {/* HERO SCORECARD & TELEMETRY */}
      {/* ---------------------------------------------------- */}
      <section className="panel" style={{ background: '#fff', borderLeft: `6px solid ${sub?.bandColor || 'var(--teal)'}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '2rem', alignItems: 'center' }}>
          {/* Left: Big Score & Accuracy Badge */}
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem', borderRight: '1px solid var(--line)' }}>
            <span className="eyebrow" style={{ color: sub?.bandColor || 'var(--teal)', fontWeight: 800 }}>
              Performance Tier: {sub?.performanceBand || 'Assessed'}
            </span>
            <div style={{ font: "400 3.8rem/1 'DM Serif Display', Georgia, serif", color: 'var(--ink)', margin: '0.4rem 0' }}>
              {sub?.percentage}%
            </div>
            <strong style={{ fontSize: '1.15rem', color: 'var(--ink)', display: 'block', marginBottom: '0.4rem' }}>
              {sub?.score} of {sub?.totalQuestions} Correct
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--moss)', margin: 0 }}>
              {student?.name ? `${student.name} · ` : ''}
              {test?.subject} · {test?.grade || 'Curriculum'}
            </p>
          </div>

          {/* Right: Summary Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
            <div style={{ background: '#fbfaf6', padding: '1rem', border: '1px solid var(--line)' }}>
              <span className="eyebrow">Subject</span>
              <strong style={{ fontSize: '1rem', color: 'var(--teal)' }}>{test?.subject}</strong>
              <small style={{ display: 'block', color: 'var(--moss)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                Curriculum Track
              </small>
            </div>

            <div style={{ background: '#fbfaf6', padding: '1rem', border: '1px solid var(--line)' }}>
              <span className="eyebrow">Attempt Status</span>
              <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>Completed</strong>
              <small style={{ display: 'block', color: 'var(--moss)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                1 Attempt Recorded
              </small>
            </div>

            <div style={{ background: '#fbfaf6', padding: '1rem', border: '1px solid var(--line)' }}>
              <span className="eyebrow">Net Accuracy</span>
              <strong style={{ fontSize: '1rem', color: sub?.percentage >= 75 ? 'var(--teal)' : 'var(--destructive)' }}>
                {sub?.percentage}%
              </strong>
              <small style={{ display: 'block', color: 'var(--moss)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                {sub?.score}/{sub?.totalQuestions} Questions
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2-COLUMN: TOPIC BREAKDOWN + AI REMEDIAL ACTIONS */}
      {/* ---------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: '1.2rem' }}>
        {/* Panel 1: Topic Mastery in this Quiz */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Concept Diagnostics</span>
              <h2>Topic Accuracy Breakdown</h2>
            </div>
            <Target size={18} color="var(--teal)" />
          </div>

          {topicWise.length > 0 ? (
            <div className="analytics-bars" style={{ marginTop: '1rem' }}>
              {topicWise.map((t) => (
                <div key={t.name} className="analytics-bar">
                  <div className="analytics-bar-label">
                    <span>
                      <b>{t.name}</b> ({t.correct}/{t.total} correct)
                    </span>
                    <b style={{ color: t.percentage >= 75 ? 'var(--teal)' : 'var(--destructive)' }}>
                      {t.percentage}%
                    </b>
                  </div>
                  <div className="analytics-bar-track">
                    <span
                      style={{
                        width: `${t.percentage}%`,
                        background: t.percentage >= 75 ? 'var(--teal)' : '#c86556',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--moss)', fontSize: '0.84rem' }}>
              Overall assessment accuracy: <strong>{sub?.percentage}%</strong> across {sub?.totalQuestions} items.
            </div>
          )}
        </section>

        {/* Panel 2: AI Remedial Recommendations */}
        <section className="panel" style={{ background: '#fff' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">AI Learning Insights</span>
              <h2>Remedial Guidance</h2>
            </div>
            <BrainCircuit size={18} color="var(--teal)" />
          </div>

          <div style={{ display: 'grid', gap: '0.8rem', marginTop: '0.5rem' }}>
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation" style={{ padding: '0.9rem' }}>
                <Lightbulb size={18} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.84rem', marginBottom: '0.2rem' }}>
                    {rec.title}
                  </strong>
                  <p style={{ margin: '0 0 0.35rem', color: 'var(--moss)', fontSize: '0.76rem' }}>
                    {rec.description}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 800 }}>
                    Action: {rec.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------- */}
      {/* QUESTION-BY-QUESTION ITEM REVIEW */}
      {/* ---------------------------------------------------- */}
      <section className="panel">
        <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="eyebrow">Item Diagnostics</span>
            <h2>Question-by-Question Review</h2>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => setFilterMode('all')}
              className={`button small ${filterMode === 'all' ? 'primary' : 'secondary'}`}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.74rem' }}
            >
              All Items ({review.length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`button small ${filterMode === 'correct' ? 'primary' : 'secondary'}`}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.74rem' }}
            >
              <CheckCircle2 size={13} /> Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`button small ${filterMode === 'incorrect' ? 'primary' : 'secondary'}`}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.74rem' }}
            >
              <XCircle size={13} /> Missed ({incorrectCount})
            </button>
          </div>
        </div>

        {filteredReview.length === 0 ? (
          <div className="state-card" style={{ padding: '2.5rem 1.5rem' }}>
            <CheckCircle2 size={24} color="var(--teal)" />
            <h3 style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No questions in this filter</h3>
            <p style={{ fontSize: '0.78rem' }}>You answered all questions correctly in this section!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.2rem', marginTop: '0.5rem' }}>
            {filteredReview.map((item, idx) => (
              <article
                key={item.questionId || idx}
                style={{
                  border: '1px solid var(--line)',
                  padding: '1.3rem',
                  background: item.isCorrect ? '#fbfdfc' : '#fff9f8',
                  borderLeft: `5px solid ${item.isCorrect ? 'var(--teal)' : 'var(--destructive)'}`,
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="eyebrow" style={{ color: 'var(--moss)', margin: 0 }}>
                      Item {idx + 1} of {review.length}
                    </span>
                    {item.topic && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.18rem 0.5rem',
                          background: '#eef5f2',
                          color: 'var(--teal)',
                          borderRadius: '3px',
                        }}
                      >
                        {item.topic}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: item.isCorrect ? 'var(--teal)' : 'var(--destructive)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.isCorrect ? (
                      <>
                        <CheckCircle2 size={15} /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle size={15} /> Incorrect
                      </>
                    )}
                  </span>
                </div>

                {/* Question Prompt */}
                <h3
                  style={{
                    font: "400 1.2rem/1.35 'DM Serif Display', Georgia, serif",
                    color: 'var(--ink)',
                    margin: '0.4rem 0 1rem',
                  }}
                >
                  {item.questionText}
                </h3>

                {/* Option List Breakdown */}
                {Array.isArray(item.options) && item.options.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {item.options.map((optText, optIdx) => {
                      const isStudentChoice = item.selectedIdx === optIdx;
                      const isCorrectChoice = item.correctIdx === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);

                      let bg = '#fff';
                      let border = '1px solid var(--line)';
                      let badge = null;

                      if (isCorrectChoice) {
                        bg = '#f0f9f6';
                        border = '1.5px solid var(--teal)';
                        badge = (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--teal)', marginLeft: 'auto' }}>
                            ✓ Correct Answer
                          </span>
                        );
                      }

                      if (isStudentChoice && !isCorrectChoice) {
                        bg = '#fdf3f1';
                        border = '1.5px solid var(--destructive)';
                        badge = (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--destructive)', marginLeft: 'auto' }}>
                            ✕ Your Answer
                          </span>
                        );
                      } else if (isStudentChoice && isCorrectChoice) {
                        badge = (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--teal)', marginLeft: 'auto' }}>
                            ✓ Your Choice (Correct)
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: bg,
                            border,
                            fontSize: '0.82rem',
                            color: 'var(--ink)',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '1.6rem',
                              height: '1.6rem',
                              borderRadius: '50%',
                              background: isCorrectChoice ? 'var(--teal)' : isStudentChoice ? 'var(--destructive)' : '#ebe7dc',
                              color: isCorrectChoice || isStudentChoice ? '#fff' : 'var(--ink)',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              flexShrink: 0,
                            }}
                          >
                            {letter}
                          </span>
                          <span style={{ fontWeight: isCorrectChoice || isStudentChoice ? 700 : 500 }}>
                            {optText}
                          </span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Compact Fallback View */
                  <div style={{ fontSize: '0.8rem', display: 'grid', gap: '0.3rem', color: 'var(--moss)' }}>
                    <div>
                      Your Selection:{' '}
                      <strong style={{ color: item.isCorrect ? 'var(--teal)' : 'var(--destructive)' }}>
                        {item.selectedText}
                      </strong>
                    </div>
                    {!item.isCorrect && (
                      <div>
                        Correct Option: <strong style={{ color: 'var(--teal)' }}>{item.correctText}</strong>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM NAV / ACTION */}
      {/* ---------------------------------------------------- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
        <Link to="/analytics" className="button primary">
          <BarChart3 size={16} /> Return to Workspace Analytics
        </Link>
        <span style={{ fontSize: '0.76rem', color: 'var(--moss)' }}>
          Assessment ID: <code>{testId}</code>
        </span>
      </div>
    </div>
  );
}
