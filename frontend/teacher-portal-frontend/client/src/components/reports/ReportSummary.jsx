import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { displayValue, initials } from '../../utils/safeData.jsx';

export default function ReportSummary({ report }) {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  if (!report) return null;

  const stats = report.stats || {};
  const submissions = Array.isArray(report.submissions) ? report.submissions : [];
  const topicBreakdown = Array.isArray(report.topicBreakdown) ? report.topicBreakdown : [];
  const questionAnalysis = Array.isArray(report.questionAnalysis) ? report.questionAnalysis : [];
  const aiRecommendations = Array.isArray(report.aiRecommendations) ? report.aiRecommendations : [];

  const averageAccuracy = stats.averageAccuracy ?? (
    stats.totalQuestions && stats.averageScore
      ? Math.round((stats.averageScore / stats.totalQuestions) * 100)
      : 0
  );

  const totalQuestions = stats.totalQuestions || questionAnalysis.length || (submissions[0]?.totalQuestions ?? 0);
  const submissionsCount = stats.submissionsCount ?? submissions.length;
  const passRate = stats.passRate ?? (
    submissionsCount > 0
      ? Math.round((submissions.filter((s) => (s.percentage ?? 0) >= 60).length / submissionsCount) * 100)
      : 0
  );

  const getBandLabel = (pct) => {
    if (pct >= 90) return 'Mastery';
    if (pct >= 75) return 'Proficient';
    if (pct >= 60) return 'Developing';
    return 'Needs Support';
  };

  const toggleQuestion = (idx) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx);
  };

  return (
    <div className="report-summary-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Header */}
      <div className="report-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--teal)', fontWeight: 800 }}>
              ASSESSMENT REPORT · {report.subject?.toUpperCase() || 'CURRICULUM'} · {report.grade || '10TH'}
            </span>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '2rem', margin: '0.4rem 0 0.6rem', color: 'var(--ink)' }}>
              {displayValue(report.title, 'Quiz Assessment Report')}
            </h2>
            <p style={{ color: 'var(--moss)', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '680px', margin: 0 }}>
              {displayValue(report.summary, 'Report telemetry computed across all student submissions.')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="score-badge strong" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
              {submissionsCount} Submission{submissionsCount === 1 ? '' : 's'}
            </span>
            <span className="score-badge excellent" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
              {totalQuestions} Questions
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        className="report-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.8rem',
        }}
      >
        <div className="stat-card" style={{ padding: '1rem', background: '#fff', border: '1px solid rgba(21,39,53,0.08)' }}>
          <span className="stat-label" style={{ fontSize: '0.62rem', color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Target size={13} color="var(--teal)" /> Class Average Accuracy
          </span>
          <strong style={{ fontSize: '2rem', margin: '0.6rem 0 0.2rem', display: 'block', color: 'var(--ink)', fontFamily: "'DM Serif Display', serif" }}>
            {averageAccuracy}%
          </strong>
          <div style={{ height: '4px', background: '#e2e8f0', width: '100%', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${averageAccuracy}%`, height: '100%', background: averageAccuracy >= 75 ? 'var(--teal)' : '#d6a83d' }} />
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1rem', background: '#fff', border: '1px solid rgba(21,39,53,0.08)' }}>
          <span className="stat-label" style={{ fontSize: '0.62rem', color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Award size={13} color="var(--teal)" /> Average Score
          </span>
          <strong style={{ fontSize: '2rem', margin: '0.6rem 0 0.2rem', display: 'block', color: 'var(--ink)', fontFamily: "'DM Serif Display', serif" }}>
            {stats.averageScore ?? (totalQuestions ? ((averageAccuracy / 100) * totalQuestions).toFixed(1) : 0)}
            <small style={{ fontSize: '0.9rem', color: 'var(--moss)', fontWeight: 400 }}> / {totalQuestions}</small>
          </strong>
          <span style={{ fontSize: '0.68rem', color: 'var(--moss)' }}>Points per student</span>
        </div>

        <div className="stat-card" style={{ padding: '1rem', background: '#fff', border: '1px solid rgba(21,39,53,0.08)' }}>
          <span className="stat-label" style={{ fontSize: '0.62rem', color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={13} color="var(--teal)" /> Pass Rate (≥60%)
          </span>
          <strong style={{ fontSize: '2rem', margin: '0.6rem 0 0.2rem', display: 'block', color: 'var(--ink)', fontFamily: "'DM Serif Display', serif" }}>
            {passRate}%
          </strong>
          <span style={{ fontSize: '0.68rem', color: 'var(--moss)' }}>Met passing benchmark</span>
        </div>

        <div className="stat-card" style={{ padding: '1rem', background: '#fff', border: '1px solid rgba(21,39,53,0.08)' }}>
          <span className="stat-label" style={{ fontSize: '0.62rem', color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={13} color="var(--teal)" /> Top Accuracy
          </span>
          <strong style={{ fontSize: '2rem', margin: '0.6rem 0 0.2rem', display: 'block', color: 'var(--teal)', fontFamily: "'DM Serif Display', serif" }}>
            {stats.highestPercentage ?? 100}%
          </strong>
          <span style={{ fontSize: '0.68rem', color: 'var(--moss)' }}>
            Leader: {stats.highestStudent || 'Top scorer'}
          </span>
        </div>
      </div>

      {/* Topic Mastery Breakdown */}
      {topicBreakdown.length > 0 && (
        <div style={{ background: '#fff', padding: '1.2rem', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div>
              <span className="eyebrow">Curriculum telemetry</span>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', margin: '0.2rem 0' }}>
                Topic & Chapter Mastery
              </h3>
            </div>
            <BookOpen size={18} color="var(--teal)" />
          </div>

          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {topicBreakdown.map((t) => (
              <div key={t.name} style={{ display: 'grid', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{t.name}</span>
                  <span style={{ color: 'var(--moss)' }}>
                    {t.correct} / {t.total} correct · <b>{t.percentage}%</b>
                  </span>
                </div>
                <div style={{ height: '7px', background: '#e9ecea', width: '100%', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${t.percentage}%`,
                      background: t.percentage >= 75 ? 'var(--teal)' : t.percentage >= 60 ? '#d6a83d' : '#c86556',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Error & Difficulty Breakdown */}
      {questionAnalysis.length > 0 && (
        <div style={{ background: '#fff', padding: '1.2rem', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div>
              <span className="eyebrow">Question diagnostics</span>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', margin: '0.2rem 0' }}>
                Question Performance Breakdown
              </h3>
            </div>
            <BarChart3 size={18} color="var(--teal)" />
          </div>

          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {questionAnalysis.map((q, idx) => {
              const isExpanded = expandedQuestion === idx;
              return (
                <div
                  key={q.questionId || idx}
                  style={{
                    border: '1px solid var(--line)',
                    padding: '0.8rem 1rem',
                    background: '#fcfbf8',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    onClick={() => toggleQuestion(idx)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      gap: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'grid',
                          placeItems: 'center',
                          background: q.accuracy >= 70 ? '#e6f4f1' : '#fcedea',
                          color: q.accuracy >= 70 ? 'var(--teal)' : '#c86556',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                        }}
                      >
                        Q{idx + 1}
                      </span>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--ink)' }}>
                        {q.questionText}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: q.accuracy >= 70 ? 'var(--teal)' : '#c86556',
                        }}
                      >
                        {q.accuracy}% Class Accuracy
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.65rem', background: '#eef3f1', padding: '0.2rem 0.5rem', color: 'var(--moss)', fontWeight: 700 }}>
                          Topic: {q.topicTag}
                        </span>
                        <span style={{ fontSize: '0.65rem', background: '#eef3f1', padding: '0.2rem 0.5rem', color: 'var(--moss)', fontWeight: 700 }}>
                          Difficulty: {q.difficulty}
                        </span>
                        <span style={{ fontSize: '0.65rem', background: '#eef3f1', padding: '0.2rem 0.5rem', color: 'var(--moss)', fontWeight: 700 }}>
                          {q.correctCount} of {q.totalAnswered} students answered correctly
                        </span>
                      </div>

                      <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.5rem' }}>
                        {(q.options || []).map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctIndex;
                          const selectedByCount = q.optionCounts?.[oIdx] || 0;
                          return (
                            <div
                              key={oIdx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.45rem 0.75rem',
                                background: isCorrect ? '#e8f5f2' : '#fff',
                                border: isCorrect ? '1px solid #8ec5b9' : '1px solid rgba(21,39,53,0.08)',
                                fontSize: '0.76rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isCorrect ? (
                                  <CheckCircle2 size={14} color="var(--teal)" />
                                ) : (
                                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1', display: 'inline-block' }} />
                                )}
                                <span style={{ fontWeight: isCorrect ? 700 : 400, color: isCorrect ? 'var(--teal)' : 'var(--ink)' }}>
                                  {opt}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--moss)' }}>
                                {selectedByCount} student{selectedByCount === 1 ? '' : 's'} chose this
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Student Submissions Table */}
      <div style={{ background: '#fff', padding: '1.2rem', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span className="eyebrow">Individual submissions</span>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', margin: '0.2rem 0' }}>
              Student Roster & Scores
            </h3>
          </div>
          <GraduationCap size={20} color="var(--teal)" />
        </div>

        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--moss)', fontSize: '0.8rem' }}>
            No student submissions recorded for this quiz yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Performance Band</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const studentName = sub.studentName || sub.student?.name || 'Student';
                  const studentEmail = sub.studentEmail || sub.student?.email || '—';
                  const pct = sub.percentage ?? (sub.totalQuestions ? Math.round((sub.score / sub.totalQuestions) * 100) : 0);
                  const bandLabel = sub.performanceBand || getBandLabel(pct);
                  const dateStr = sub.submittedAt
                    ? new Date(sub.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr key={sub._id || sub.id || studentEmail}>
                      <td>
                        <div className="table-person">
                          <span className="avatar small">{initials(studentName)}</span>
                          <strong>{studentName}</strong>
                        </div>
                      </td>
                      <td style={{ color: 'var(--moss)', fontSize: '0.74rem' }}>{studentEmail}</td>
                      <td>
                        <strong>{sub.score}</strong> / {sub.totalQuestions || totalQuestions}
                      </td>
                      <td>
                        <strong style={{ color: pct >= 75 ? 'var(--teal)' : pct >= 60 ? '#d6a83d' : '#c86556' }}>
                          {pct}%
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.55rem',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '2px',
                            background:
                              pct >= 90
                                ? '#e6f4f1'
                                : pct >= 75
                                ? '#eaf4f2'
                                : pct >= 60
                                ? '#fff6e5'
                                : '#fdefec',
                            color:
                              pct >= 90
                                ? '#0e8f86'
                                : pct >= 75
                                ? '#159a90'
                                : pct >= 60
                                ? '#a0741c'
                                : '#c86556',
                          }}
                        >
                          {bandLabel}
                        </span>
                      </td>
                      <td style={{ color: 'var(--moss)', fontSize: '0.72rem' }}>{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Pedagogical Recommendations */}
      {aiRecommendations.length > 0 && (
        <div style={{ background: '#f5faf8', padding: '1.2rem', border: '1px solid #c2e2da' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <Sparkles size={18} color="var(--teal)" />
            <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', margin: 0, color: 'var(--ink)' }}>
              AI Teaching Recommendations
            </h4>
          </div>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: '#fff',
                  padding: '0.8rem 1rem',
                  borderLeft: '3px solid var(--teal)',
                  fontSize: '0.78rem',
                }}
              >
                <strong style={{ display: 'block', color: 'var(--ink)', marginBottom: '0.2rem' }}>
                  {rec.title}
                </strong>
                <p style={{ margin: '0 0 0.3rem', color: 'var(--moss)', lineHeight: 1.5 }}>
                  {rec.description}
                </p>
                <span style={{ fontWeight: 800, color: 'var(--teal)', fontSize: '0.72rem' }}>
                  Suggested Action: {rec.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
