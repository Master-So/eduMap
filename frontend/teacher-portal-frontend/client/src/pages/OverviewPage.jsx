import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, BrainCircuit, ChevronDown, CircleAlert, RefreshCw, Target, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { reportService } from '../services/reportService.jsx';

const defaultAnalysis = {
  source: 'live',
  totals: { quizzes: 0, submissions: 0, students: 0, correct: 0, answers: 0, percentage: 0 },
  subjectWise: [],
  chapterWise: [],
  students: [],
  insights: {
    weakestSubject: 'No subject signal yet.',
    weakestChapter: 'No chapter signal yet.',
    recommendation: 'Publish a quiz and have connected students take it to generate live performance insights.',
  },
  aiAnalysis: {
    weakestSubject: null,
    weakestChapter: null,
    recommendations: [
      'Share your connection key in the Students tab to onboard students.',
      'Create and publish curriculum quizzes from the Create Quiz tab.',
      'Student submissions will automatically generate live AI insights and topic heatmaps.',
    ],
    teacherSummary: 'No student submissions recorded yet. Once your connected students submit quizzes, real performance metrics and Gemini analysis will appear here.',
    dashboard: {
      kpis: { averageAccuracy: 0, totalQuestions: 0, submissions: 0, students: 0, weakSubject: '—', weakChapter: '—' },
      trend: [],
      subjectBars: [],
      chapterBars: [],
      distribution: [
        { label: 'Needs support', range: '0–59%', count: 0, color: '#c86556' },
        { label: 'Watch closely', range: '60–74%', count: 0, color: '#d6a83d' },
        { label: 'On track', range: '75–89%', count: 0, color: '#159a90' },
        { label: 'Excelling', range: '90–100%', count: 0, color: '#6f8fbe' },
      ],
    },
  },
};

function normalizeAnalysis(raw) {
  if (!raw) return defaultAnalysis;
  const source = raw.source || 'live';
  const ai = raw.aiAnalysis || {};
  const fallback = defaultAnalysis.aiAnalysis;
  const dashboard = ai.dashboard || {};
  return {
    ...defaultAnalysis,
    ...raw,
    source,
    totals: { ...defaultAnalysis.totals, ...(raw.totals || {}) },
    subjectWise: Array.isArray(raw.subjectWise) ? raw.subjectWise : [],
    chapterWise: Array.isArray(raw.chapterWise) ? raw.chapterWise : [],
    students: Array.isArray(raw.students) ? raw.students : [],
    aiAnalysis: {
      ...fallback,
      ...ai,
      dashboard: { ...fallback.dashboard, ...dashboard },
    },
  };
}

function formatPercent(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return `${fallback}%`;
  if (typeof val === 'number') {
    return isNaN(val) ? `${fallback}%` : `${Math.round(val)}%`;
  }
  const str = String(val).trim();
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return `${fallback}%`;
  return `${Math.round(num)}%`;
}

function cleanPercentNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : Math.round(val);
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? fallback : Math.round(num);
}

function TrendChart({ values }) {
  if (!values || !values.length) {
    return (
      <div className="reference-chart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}>
        <p style={{ color: 'var(--ref-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
          No submission trend data yet. Connected student quiz attempts will plot accuracy over time here.
        </p>
      </div>
    );
  }
  const points = values.map((v) => cleanPercentNumber(v));
  const max = 100;
  const min = 0;
  const range = 100;
  const coords = points.length === 1
    ? `0,${100 - (points[0] / range) * 80 - 10} 100,${100 - (points[0] / range) * 80 - 10}`
    : points.map((value, index) => `${(index / Math.max(points.length - 1, 1)) * 100},${100 - (value / range) * 80 - 10}`).join(' ');
  const area = `0,100 ${coords} 100,100`;
  return (
    <div className="reference-chart">
      <div className="chart-y-axis">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Accuracy trend chart">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8eb0d7" stopOpacity=".68" />
            <stop offset="100%" stopColor="#8eb0d7" stopOpacity=".14" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#trendFill)" />
        <polyline points={coords} fill="none" stroke="#5d87bd" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="chart-x-axis">
        {points.map((_, index) => <span key={index}>#{index + 1}</span>)}
      </div>
    </div>
  );
}

function SubjectBars({ items, active, onSelect }) {
  if (!items || !items.length) {
    return (
      <div className="reference-bars" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}>
        <p style={{ color: 'var(--ref-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
          No subject performance data recorded yet. Create and publish quizzes across curriculum subjects to see breakdowns.
        </p>
      </div>
    );
  }
  return (
    <div className="reference-bars">
      {items.map((item) => {
        const percentVal = cleanPercentNumber(item.value || item.percentage || 0);
        return (
          <button
            key={item.label || item.name}
            className={`reference-bar-row ${active === (item.label || item.name) ? 'active' : ''}`}
            onClick={() => onSelect(item.label || item.name)}
          >
            <span>{item.label || item.name}</span>
            <i><b style={{ height: `${percentVal}%` }} /></i>
            <strong>{formatPercent(percentVal)}</strong>
          </button>
        );
      })}
    </div>
  );
}

function DistributionChart({ items }) {
  const total = items.reduce((sum, item) => sum + (item.count || 0), 0);
  if (!total) {
    return (
      <div className="distribution-chart-wrap">
        <div className="distribution-donut" style={{ background: '#e2e8f0' }}>
          <div>
            <strong>0</strong>
            <span>students</span>
          </div>
        </div>
        <div className="distribution-legend">
          {items.map((item) => (
            <div key={item.label}>
              <span style={{ background: item.color }} />
              <b>{item.label}</b>
              <small>0 · {item.range}</small>
            </div>
          ))}
        </div>
      </div>
    );
  }
  let cursor = 0;
  const segments = items.map((item) => {
    const start = cursor;
    cursor += ((item.count || 0) / total) * 360;
    return { ...item, start, end: cursor };
  });
  const gradient = segments.map((item) => `${item.color || '#84a56c'} ${item.start}deg ${item.end}deg`).join(', ');
  return (
    <div className="distribution-chart-wrap">
      <div className="distribution-donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div>
          <strong>{total}</strong>
          <span>students</span>
        </div>
      </div>
      <div className="distribution-legend">
        {items.map((item) => (
          <div key={item.label}>
            <span style={{ background: item.color }} />
            <b>{item.label}</b>
            <small>{item.count} · {item.range}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { teacher } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [period, setPeriod] = useState('This week');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [gradeFilter, setGradeFilter] = useState('All grades');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await reportService.analyzeAnalytics();
      setAnalysis(normalizeAnalysis(response?.analysis || response));
      setError('');
    } catch (loadError) {
      setAnalysis(defaultAnalysis);
      setError(loadError?.message || 'Unable to load live analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const data = normalizeAnalysis(analysis);
  const dashboard = data.aiAnalysis?.dashboard || {};
  const kpis = dashboard.kpis || {};
  const subjectBars = dashboard.subjectBars?.length ? dashboard.subjectBars : (data.subjectWise || []).map((item) => ({ label: item.name, value: item.percentage }));
  const chapterBars = dashboard.chapterBars?.length ? dashboard.chapterBars : (data.chapterWise || []).map((item) => ({ label: item.name, group: item.subject, value: item.percentage }));
  const distribution = dashboard.distribution?.length ? dashboard.distribution : defaultAnalysis.aiAnalysis.dashboard.distribution;

  const visibleChapters = useMemo(
    () => chapterBars.filter((item) => subjectFilter === 'All subjects' || item.group === subjectFilter).sort((a, b) => a.value - b.value),
    [chapterBars, subjectFilter]
  );

  const refresh = async () => {
    setAnalyzing(true);
    try {
      const response = await reportService.analyzeAnalytics();
      setAnalysis(normalizeAnalysis(response?.analysis || response));
      setError('');
    } catch (analysisError) {
      setError(analysisError?.message || 'Could not refresh analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-stack reference-dashboard">
      <PageHeader
        eyebrow="Report analysis"
        title={`Classroom report, ${teacher?.name?.split(' ')[0] || 'teacher'}.`}
        description="A decision-ready view of your students' MCQ performance, generated from server scores and Gemini analysis."
        action={
          <button className="button secondary" onClick={refresh} disabled={analyzing}>
            <RefreshCw size={15} /> {analyzing ? 'Refreshing' : 'Refresh analysis'}
          </button>
        }
      />

      <div className="reference-toolbar">
        <label>
          Date range
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option>This week</option>
            <option>Last 30 days</option>
            <option>This term</option>
          </select>
        </label>
        <label>
          Grade
          <select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}>
            <option>All grades</option>
            <option>10th</option>
            <option>12th</option>
          </select>
        </label>
        <label>
          Subject
          <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
            <option>All subjects</option>
            {(data.subjectWise || []).map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        <span className="analysis-source live">Live classroom data</span>
      </div>

      {error && <div className="inline-notice error">{error}</div>}

      {loading ? (
        <div className="panel analytics-loading">Loading report analysis...</div>
      ) : (
        <>
          <section className="reference-kpis">
            <div className="reference-kpi">
              <span>Average accuracy</span>
              <strong>{formatPercent(kpis.averageAccuracy ?? data.totals?.percentage ?? 0)}</strong>
              <small>Across all submitted MCQs</small>
            </div>
            <div className="reference-kpi">
              <span>Total questions</span>
              <strong>{kpis.totalQuestions ?? data.totals?.answers ?? 0}</strong>
              <small>{period.toLowerCase()}</small>
            </div>
            <div className="reference-kpi">
              <span>Completed submissions</span>
              <strong>{kpis.submissions ?? data.totals?.submissions ?? 0}</strong>
              <small>{kpis.students ?? data.totals?.students ?? 0} connected students</small>
            </div>
            <div className="reference-kpi">
              <span>Connected students</span>
              <strong>{kpis.students ?? data.totals?.connectedStudents ?? data.totals?.students ?? 0}</strong>
              <small>Current classroom connections</small>
            </div>
            <div className="reference-kpi">
              <span>Weakest subject</span>
              <strong className="kpi-text">{kpis.weakSubject || data.aiAnalysis?.weakestSubject?.name || '—'}</strong>
              <small>{data.aiAnalysis?.weakestSubject?.percentage !== undefined && data.aiAnalysis?.weakestSubject?.percentage !== null ? `${formatPercent(data.aiAnalysis.weakestSubject.percentage)} average` : 'No data yet'}</small>
            </div>
            <div className="reference-kpi">
              <span>Weakest chapter</span>
              <strong className="kpi-text">{kpis.weakChapter || data.aiAnalysis?.weakestChapter?.name || '—'}</strong>
              <small>{data.aiAnalysis?.weakestChapter?.percentage !== undefined && data.aiAnalysis?.weakestChapter?.percentage !== null ? `${formatPercent(data.aiAnalysis.weakestChapter.percentage)} average` : 'No data yet'}</small>
            </div>
          </section>

          <section className="reference-chart-grid">
            <div className="reference-panel trend-panel">
              <div className="reference-panel-head">
                <div>
                  <span className="eyebrow">Accuracy movement</span>
                  <h2>Class accuracy over time</h2>
                </div>
                <span className="chart-caption">{period}</span>
              </div>
              <TrendChart values={dashboard.trend} />
            </div>

            <div className="reference-panel comparison-panel">
              <div className="reference-panel-head">
                <div>
                  <span className="eyebrow">Subject comparison</span>
                  <h2>Accuracy by subject</h2>
                </div>
                <BarChart3 size={18} />
              </div>
              <SubjectBars
                items={subjectBars}
                active={subjectFilter}
                onSelect={(name) => setSubjectFilter(subjectFilter === name ? 'All subjects' : name)}
              />
            </div>

            <div className="reference-panel distribution-panel-ref">
              <div className="reference-panel-head">
                <div>
                  <span className="eyebrow">Student distribution</span>
                  <h2>Performance bands</h2>
                </div>
                <UsersRound size={18} />
              </div>
              <DistributionChart items={distribution} />
            </div>
          </section>

          <section className="reference-lower-grid">
            <div className="reference-panel chapter-analysis">
              <div className="reference-panel-head">
                <div>
                  <span className="eyebrow">Chapter analysis</span>
                  <h2>{subjectFilter === 'All subjects' ? 'Weakest chapters overall' : `${subjectFilter} chapters`}</h2>
                </div>
                <span className="analysis-count">{visibleChapters.length} topics</span>
              </div>
              {visibleChapters.length === 0 ? (
                <p className="muted-note" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  No chapter accuracy recorded yet. Student quiz answers will populate topic mastery rankings.
                </p>
              ) : (
                <div className="chapter-analysis-list">
                  {visibleChapters.slice(0, 8).map((item, index) => {
                    const percentVal = cleanPercentNumber(item.value);
                    return (
                      <div key={item.label}>
                        <span className="chapter-number">{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <b>{item.label}</b>
                          <small>{item.group}</small>
                          <span className="mini-track">
                            <i style={{ width: `${percentVal}%` }} />
                          </span>
                        </div>
                        <strong className={percentVal < 60 ? 'weak-value' : ''}>{formatPercent(percentVal)}</strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="reference-panel insight-analysis">
              <div className="reference-panel-head">
                <div>
                  <span className="eyebrow">AI Teaching brief</span>
                  <h2>What to do next</h2>
                </div>
                <BrainCircuit size={18} />
              </div>
              <div className="insight-callout">
                <CircleAlert size={17} />
                <div>
                  <b>
                    {data.aiAnalysis?.weakestSubject?.name
                      ? `${data.aiAnalysis.weakestSubject.name} · ${formatPercent(data.aiAnalysis.weakestSubject.percentage)}`
                      : 'Classroom setup in progress'}
                  </b>
                  <span>{data.aiAnalysis?.teacherSummary || data.insights?.recommendation}</span>
                </div>
              </div>
              <div className="recommendation-list-ref">
                {(data.aiAnalysis?.recommendations || []).map((item) => (
                  <div key={item}>
                    <ChevronDown size={14} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/reports" className="button secondary">
                Open response reports <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          <div className="reference-footer">
            <Target size={15} />
            <span>Powered by server-scored MCQs and the AI analysis contract. Subject and chapter metadata stays hidden from students.</span>
          </div>
        </>
      )}
    </div>
  );
}
