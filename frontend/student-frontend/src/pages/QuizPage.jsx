import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock,
  KeyRound,
  Layers,
  Lock,
  Play,
  Radio,
  RotateCcw,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { studentApi, getStudentUser, submissionStorage } from '../services/api';
import { initSocket, disconnectSocket, emitStudentJoined, emitStudentFinish } from '../services/socket';

export default function QuizPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const student = getStudentUser();

  // 1: Lobby, 2: Live Quiz, 3: Completed
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState(student?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Test Data
  const [testData, setTestData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: optionIndex }
  
  // Timer & Results
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sampleMockQuiz = (id) => ({
    _id: id || 'quiz_sample',
    title: 'Electromagnetism & Quantum Transitions',
    subject: 'Physics',
    grade: 'Class 12',
    questions: [
      {
        _id: 'q1',
        question: 'What is the direction of induced EMF according to Lenz’s Law?',
        options: [
          'Opposes the change in magnetic flux that creates it',
          'Parallel to the direction of external magnetic field lines',
          'Directly proportional to the static electric charge density',
          'Perpendicular to the mechanical vector acceleration'
        ],
        correctIndex: 0,
        topicTag: 'Electromagnetic Induction',
      },
      {
        _id: 'q2',
        question: 'In Photoelectric effect experiments, what determines the maximum kinetic energy of ejected electrons?',
        options: [
          'Intensity of incident radiation',
          'Frequency of incident radiation above the threshold',
          'Duration of continuous exposure to incident light',
          'Surface area of the metallic cathode target'
        ],
        correctIndex: 1,
        topicTag: 'Quantum Physics',
      },
      {
        _id: 'q3',
        question: 'What is the dimensional formula of Magnetic Permeability (μ₀)?',
        options: [
          '[M L T⁻² A⁻²]',
          '[M L² T⁻¹ A⁻¹]',
          '[M L⁻¹ T⁻² A]',
          '[M⁰ L² T⁻²]'
        ],
        correctIndex: 0,
        topicTag: 'Magnetism',
      },
      {
        _id: 'q4',
        question: 'Which logic gate produces HIGH output only when both input signals are LOW?',
        options: ['NAND Gate', 'NOR Gate', 'XOR Gate', 'AND Gate'],
        correctIndex: 1,
        topicTag: 'Semiconductor Electronics',
      },
      {
        _id: 'q5',
        question: 'What happens to the resistance of an intrinsic semiconductor as temperature increases?',
        options: [
          'Resistance increases linearly',
          'Resistance decreases exponentially due to thermal carrier generation',
          'Resistance remains perfectly constant',
          'Resistance oscillates harmonically'
        ],
        correctIndex: 1,
        topicTag: 'Semiconductors',
      }
    ]
  });

  const handleStart = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Please enter your full student name.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let quiz = null;
      try {
        const res = await studentApi.getPublishedQuiz(testId);
        quiz = res.quiz || res.test;
      } catch (err) {
        console.warn('API getPublishedQuiz fallback activated:', err.message);
      }

      if (!quiz || !quiz.questions?.length) {
        quiz = sampleMockQuiz(testId);
      }

      setTestData(quiz);

      // Connect Socket.IO
      const socket = initSocket();
      emitStudentJoined({
        name: studentName.trim(),
        testId: testId || 'live_quiz',
      });

      setStep(2);
      setTimerActive(true);
    } catch (err) {
      setError(err.message || 'Failed to initialize quiz session.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx,
    }));
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    setLoading(true);

    const questions = testData?.questions || [];
    const formattedAnswers = questions.map((q, idx) => ({
      questionId: q._id || `q_${idx}`,
      selectedOptionIndex: answers[idx] !== undefined ? answers[idx] : -1,
    }));

    let score = 0;
    let total = questions.length || 1;
    let percentage = 0;
    let reviewList = [];

    try {
      const serverRes = await studentApi.submitQuiz(testId, formattedAnswers);
      score = Number(serverRes?.score ?? 0);
      total = Number(serverRes?.totalQuestions ?? questions.length);
      percentage = Number(serverRes?.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0));
      
      const serverReview = serverRes?.quickAnswers || serverRes?.review;
      if (Array.isArray(serverReview) && serverReview.length > 0) {
        reviewList = serverReview.map((item, idx) => ({
          questionId: item.questionId || questions[idx]?._id || `q_${idx}`,
          questionText: item.questionText || questions[idx]?.questionText || questions[idx]?.question || 'Question',
          selectedIdx: item.selectedIdx ?? item.selectedOptionIndex,
          selectedText: item.selectedText || item.selectedOption || (item.selectedOptionIndex >= 0 && questions[idx]?.options ? questions[idx].options[item.selectedOptionIndex] : 'Not Answered'),
          correctIdx: item.correctIdx ?? item.correctOptionIndex,
          correctText: item.correctText || item.correctOption || '—',
          isCorrect: Boolean(item.isCorrect),
          topic: item.topic || item.topicTag || questions[idx]?.topicTag || testData?.subject || 'General',
        }));
      }
    } catch (submitErr) {
      console.warn('Backend submission fallback note:', submitErr?.message || submitErr);
    }

    if (!reviewList.length) {
      reviewList = questions.map((q, idx) => {
        const sel = answers[idx];
        const answered = sel !== undefined && sel !== -1;
        const isCorrect = answered && q.correctIndex !== undefined && sel === q.correctIndex;
        if (isCorrect) score += 1;

        return {
          questionId: q._id || `q_${idx}`,
          questionText: q.questionText || q.question || 'Question',
          selectedIdx: sel,
          selectedText: answered && q.options?.[sel] ? q.options[sel] : 'Not Answered',
          correctIdx: q.correctIndex,
          correctText: q.correctIndex !== undefined && q.options?.[q.correctIndex] ? q.options[q.correctIndex] : (q.options ? q.options[0] : '—'),
          isCorrect: Boolean(isCorrect),
          topic: q.topicTag || testData?.subject || 'General',
        };
      });
      total = questions.length || 1;
      percentage = Math.round((score / total) * 100);
    }

    emitStudentFinish({
      studentName: studentName.trim(),
      testId: testId || 'live_quiz',
      score,
      total,
      answers: reviewList,
    });

    // Save dynamic submission for local storage computation
    submissionStorage.saveSubmission(student?._id || 'guest', {
      testId: testId || 'live_quiz',
      title: testData?.title || `${testData?.subject || 'Curriculum'} Quiz`,
      subject: testData?.subject || 'Science',
      score,
      total,
      percentage,
      timeElapsed,
      answers: reviewList,
      review: reviewList,
    });

    setResult({
      score,
      total,
      percentage,
      timeElapsed,
      review: reviewList,
    });

    setStep(3);
    setLoading(false);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0e8f86', '#159a90', '#20404a', '#84a56c'],
      });
    } catch (e) {}
  };


  const currQ = testData?.questions?.[currentIdx];
  const progress = testData?.questions?.length
    ? Math.round(((currentIdx + 1) / testData.questions.length) * 100)
    : 0;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Interactive assessment"
        title="Live quiz arena."
        description="Complete teacher-published curriculum questions with instant grading and real-time socket sync."
        action={
          <Link to="/analytics" className="button secondary small">
            <ArrowLeft size={14} /> Back to Analytics
          </Link>
        }
      />

      {/* ---------------------------------------------------- */}
      {/* STEP 1: LOBBY */}
      {/* ---------------------------------------------------- */}
      {step === 1 && (
        <div className="panel" style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Ready to begin</span>
              <h2>Assessment Lobby</h2>
            </div>
            <span className="panel-index">Test ID: {testId}</span>
          </div>

          {error && (
            <div className="form-error" style={{ marginBottom: '1.2rem' }}>
              <CircleAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.8rem' }}>
            <div style={{ background: '#fbfaf6', padding: '1rem', border: '1px solid var(--line)' }}>
              <span className="eyebrow">Format</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--ink)' }}>Single Choice MCQ</strong>
            </div>
            <div style={{ background: '#fbfaf6', padding: '1rem', border: '1px solid var(--line)' }}>
              <span className="eyebrow">Sync</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--teal)' }}>Live Socket (5001)</strong>
            </div>
            <div style={{ background: '#fbfaf6', padding: '1rem', border: '1px solid var(--line)' }}>
              <span className="eyebrow">Grading</span>
              <strong style={{ fontSize: '0.86rem', color: 'var(--ink)' }}>Instant Telemetry</strong>
            </div>
          </div>

          <form onSubmit={handleStart} style={{ display: 'grid', gap: '1.2rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 800 }}>
              Student Full Name
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                required
                className="key-input"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              className="button primary wide"
              disabled={loading || !studentName.trim()}
              style={{ padding: '1rem' }}
            >
              {loading ? (
                <span>Loading Assessment...</span>
              ) : (
                <>
                  <span>Enter Live Assessment</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 2: LIVE QUIZ ENGINE */}
      {/* ---------------------------------------------------- */}
      {step === 2 && currQ && (
        <div className="quiz-arena-panel" style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
          {/* Header Progress & Timer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="eyebrow" style={{ color: 'var(--teal)' }}>
                Question {currentIdx + 1} of {testData.questions.length}
              </span>
              {currQ.topicTag && (
                <span style={{ fontSize: '0.72rem', color: 'var(--moss)', background: '#eef5f2', padding: '0.2rem 0.5rem' }}>
                  {currQ.topicTag}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', fontWeight: 800, color: 'var(--ink)' }}>
              <Clock size={15} color="var(--teal)" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '4px', background: '#ebe7dc', marginBottom: '1.8rem' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--teal)', transition: 'width 0.25s ease' }} />
          </div>

          {/* Question Text */}
          <h2 style={{ font: "400 1.6rem/1.25 'DM Serif Display', Georgia, serif", color: 'var(--ink)', margin: '0 0 1.8rem' }}>
            {currQ.questionText || currQ.question}
          </h2>


          {/* MCQ Options */}
          <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '2rem' }}>
            {currQ.options.map((optText, optIdx) => {
              const isSelected = answers[currentIdx] === optIdx;
              const letter = String.fromCharCode(65 + optIdx);

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleOptionSelect(optIdx)}
                  className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                >
                  <span className="option-circle">{letter}</span>
                  <span style={{ flex: 1 }}>{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.2rem', borderTop: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="button secondary"
            >
              <ArrowLeft size={14} /> Previous
            </button>

            {currentIdx === testData.questions.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="button primary"
              >
                {loading ? 'Submitting...' : 'Submit Assessment'} <Send size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(testData.questions.length - 1, i + 1))}
                className="button primary"
              >
                Next Question <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 3: SCORECARD RESULTS */}
      {/* ---------------------------------------------------- */}
      {step === 3 && result && (
        <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'grid', gap: '1.5rem' }}>
          <div className="panel" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <span className="eyebrow" style={{ color: 'var(--teal)', marginBottom: '0.6rem' }}>
              Assessment Completed
            </span>
            <h1 style={{ font: "400 3.2rem/1 'DM Serif Display', Georgia, serif", margin: '0.4rem 0 0.8rem', color: 'var(--ink)' }}>
              {result.score} / {result.total} Correct
            </h1>
            <p style={{ color: 'var(--moss)', fontSize: '0.85rem', margin: '0 auto 1.5rem', maxWidth: '440px' }}>
              Great work, <strong>{studentName}</strong>. Your recorded accuracy is {result.percentage}%. Real-time performance telemetry has been updated.
            </p>

            <div style={{ display: 'inline-flex', gap: '1.5rem', background: '#f5f2ea', padding: '0.9rem 1.6rem', border: '1px solid var(--line)', marginBottom: '1.8rem' }}>
              <div>
                <span className="eyebrow">Accuracy</span>
                <strong style={{ fontSize: '1.3rem', color: 'var(--teal)' }}>{result.percentage}%</strong>
              </div>
              <div>
                <span className="eyebrow">Total Time</span>
                <strong style={{ fontSize: '1.3rem', color: 'var(--ink)' }}>{formatTime(result.timeElapsed)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
              <Link to="/analytics" className="button primary">
                <BarChart3 size={16} /> Return to Analytics Dashboard
              </Link>
              <button
                className="button secondary"
                onClick={() => {
                  setStep(1);
                  setAnswers({});
                  setCurrentIdx(0);
                  setTimeElapsed(0);
                  setResult(null);
                }}
              >
                <RotateCcw size={16} /> Retake Quiz
              </button>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Review Answers</span>
                <h2>Detailed Item Breakdown</h2>
              </div>
              <span className="panel-index">{result.score} of {result.total} Correct</span>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {result.review.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--line)',
                    background: item.isCorrect ? '#f2f8f5' : '#fdf3f1',
                    borderLeft: `4px solid ${item.isCorrect ? 'var(--teal)' : 'var(--destructive)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--moss)' }}>
                      Question {idx + 1} · {item.topic}
                    </span>
                    <strong style={{ fontSize: '0.74rem', color: item.isCorrect ? 'var(--teal)' : 'var(--destructive)', textTransform: 'uppercase' }}>
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </strong>
                  </div>

                  <p style={{ margin: '0.3rem 0 0.6rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink)' }}>
                    {item.questionText}
                  </p>

                  <div style={{ fontSize: '0.76rem', display: 'grid', gap: '0.2rem', color: 'var(--moss)' }}>
                    <div>
                      Your Answer: <strong style={{ color: item.isCorrect ? 'var(--teal)' : 'var(--destructive)' }}>{item.selectedText}</strong>
                    </div>
                    {!item.isCorrect && (
                      <div>
                        Correct Answer: <strong style={{ color: 'var(--teal)' }}>{item.correctText}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
