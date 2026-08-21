import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, BarChart3, BrainCircuit, ChevronDown, CircleAlert, RefreshCw, Target, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { reportService } from '../services/reportService.jsx';

const demoAnalysis = {
  source: 'demo',
  totals: { quizzes: 4, submissions: 20, students: 20, correct: 352, answers: 500, percentage: 70 },
  subjectWise: [{ name: 'Physics', percentage: 85, correct: 85, total: 100 }, { name: 'Chemistry', percentage: 72, correct: 72, total: 100 }, { name: 'Math', percentage: 64, correct: 64, total: 100 }, { name: 'Computer Science', percentage: 91, correct: 91, total: 100 }],
  chapterWise: [{ name: 'Electrostatics', percentage: 40, subject: 'Physics' }, { name: 'Current Electricity', percentage: 63, subject: 'Physics' }, { name: 'Optics', percentage: 78, subject: 'Physics' }, { name: 'Thermodynamics', percentage: 82, subject: 'Physics' }, { name: 'Chemical Reactions', percentage: 72, subject: 'Chemistry' }, { name: 'Acids, Bases and Salts', percentage: 68, subject: 'Chemistry' }, { name: 'Real Numbers', percentage: 61, subject: 'Math' }, { name: 'Quadratic Equations', percentage: 67, subject: 'Math' }, { name: 'Data Structures', percentage: 93, subject: 'Computer Science' }, { name: 'SQL', percentage: 89, subject: 'Computer Science' }],
  students: Array.from({ length: 20 }, (_, index) => ({ id: `demo-${index + 1}`, name: `Demo Student ${String(index + 1).padStart(2, '0')}`, percentage: 55 + ((index * 7) % 41), submissions: 1 })),
  insights: { recommendation: 'Create a focused Electrostatics practice quiz and revisit the core formula patterns before the next assessment.' },
  aiAnalysis: { weakestSubject: { name: 'Math', percentage: 64 }, weakestChapter: { name: 'Electrostatics', percentage: 40, subject: 'Physics' }, recommendations: ['Conduct targeted revision sessions for Math.', 'Provide remedial worksheets for Electrostatics.', 'Reuse the Computer Science approach across lower-performing subjects.'], teacherSummary: 'The class is performing well in Computer Science but needs a focused intervention in Math and Electrostatics.' },
};

function normalizeAnalysis(raw) {
  if (!raw) return demoAnalysis;
  const source = raw.source || 'live';
  const ai = raw.aiAnalysis || {};
  const fallback = demoAnalysis.aiAnalysis;
  const dashboard = ai.dashboard || {};
  return { ...demoAnalysis, ...raw, source, aiAnalysis: { ...fallback, ...ai, dashboard: { ...fallback.dashboard, ...dashboard } } };
}

function TrendChart({ values }) {
  const points = values?.length ? values : [70, 62, 74, 67, 79, 75, 70];
  const max = Math.max(...points, 100); const min = Math.min(...points, 0); const range = Math.max(max - min, 1);
  const coords = points.map((value, index) => `${(index / (points.length - 1)) * 100},${100 - ((value - min) / range) * 80 - 10}`).join(' ');
  const area = `0,100 ${coords} 100,100`;
  return <div className="reference-chart"><div className="chart-y-axis"><span>{max}%</span><span>{Math.round((max + min) / 2)}%</span><span>{min}%</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Accuracy trend chart"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8eb0d7" stopOpacity=".68" /><stop offset="100%" stopColor="#8eb0d7" stopOpacity=".14" /></linearGradient></defs><polygon points={area} fill="url(#trendFill)" /><polyline points={coords} fill="none" stroke="#5d87bd" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg><div className="chart-x-axis">{points.map((_, index) => <span key={index}>{index + 1}</span>)}</div></div>;
}

function SubjectBars({ items, active, onSelect }) {
  return <div className="reference-bars">{items.map((item) => <button key={item.label || item.name} className={`reference-bar-row ${active === (item.label || item.name) ? 'active' : ''}`} onClick={() => onSelect(item.label || item.name)}><span>{item.label || item.name}</span><i><b style={{ height: `${item.value || item.percentage || 0}%` }} /></i><strong>{item.value || item.percentage || 0}%</strong></button>)}</div>;
}

function DistributionChart({ items }) {
  const total = items.reduce((sum, item) => sum + (item.count || 0), 0) || 1;
  let cursor = 0;
  const segments = items.map((item) => { const start = cursor; cursor += ((item.count || 0) / total) * 360; return { ...item, start, end: cursor }; });
  const gradient = segments.map((item) => `${item.color || '#84a56c'} ${item.start}deg ${item.end}deg`).join(', ');
  return <div className="distribution-chart-wrap"><div className="distribution-donut" style={{ background: `conic-gradient(${gradient})` }}><div><strong>{total}</strong><span>students</span></div></div><div className="distribution-legend">{items.map((item) => <div key={item.label}><span style={{ background: item.color }} /><b>{item.label}</b><small>{item.count} · {item.range}</small></div>)}</div></div>;
}

export default function OverviewPage() {
  const { teacher } = useAuth();
  const [analysis, setAnalysis] = useState(null); const [period, setPeriod] = useState('This week'); const [subjectFilter, setSubjectFilter] = useState('All subjects'); const [gradeFilter, setGradeFilter] = useState('All grades'); const [loading, setLoading] = useState(true); const [analyzing, setAnalyzing] = useState(false); const [error, setError] = useState('');
  const load = async () => { setLoading(true); try { const response = await reportService.analyzeAnalytics(); setAnalysis(normalizeAnalysis(response?.analysis || response)); setError(''); } catch (loadError) { setAnalysis(demoAnalysis); setError(loadError?.message || 'Live analysis is unavailable. Showing demo analysis.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const data = normalizeAnalysis(analysis); const dashboard = data.aiAnalysis?.dashboard || {}; const kpis = dashboard.kpis || {}; const subjectBars = dashboard.subjectBars?.length ? dashboard.subjectBars : data.subjectWise.map((item) => ({ label: item.name, value: item.percentage })); const chapterBars = dashboard.chapterBars?.length ? dashboard.chapterBars : data.chapterWise.map((item) => ({ label: item.name, group: item.subject, value: item.percentage })); const distribution = dashboard.distribution?.length ? dashboard.distribution : [];
  const visibleChapters = useMemo(() => chapterBars.filter((item) => subjectFilter === 'All subjects' || item.group === subjectFilter).sort((a, b) => a.value - b.value), [chapterBars, subjectFilter]);
  const refresh = async () => { setAnalyzing(true); try { const response = await reportService.analyzeAnalytics(); setAnalysis(normalizeAnalysis(response?.analysis || response)); setError(''); } catch (analysisError) { setError(analysisError?.message || 'Could not refresh analysis.'); } finally { setAnalyzing(false); } };
  return <div className="page-stack reference-dashboard"><PageHeader eyebrow="Report analysis" title={`Classroom report, ${teacher?.name?.split(' ')[0] || 'teacher'}.`} description="A decision-ready view of your students' MCQ performance, generated from server scores and Gemini analysis." action={<button className="button secondary" onClick={refresh} disabled={analyzing}><RefreshCw size={15} /> {analyzing ? 'Refreshing' : 'Refresh analysis'}</button>} />
    <div className="reference-toolbar"><label>Date range<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>This week</option><option>Last 30 days</option><option>This term</option></select></label><label>Grade<select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}><option>All grades</option><option>10th</option><option>12th</option></select></label><label>Subject<select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option>All subjects</option>{data.subjectWise.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><span className={`analysis-source ${data.source}`}>{data.source === 'demo' ? 'Demo preview data' : 'Live API analysis'}</span></div>
    {error && <div className="inline-notice error">{error}</div>}
    {loading ? <div className="panel analytics-loading">Loading report analysis...</div> : <>
      <section className="reference-kpis"><div className="reference-kpi"><span>Average accuracy</span><strong>{kpis.averageAccuracy ?? data.totals?.percentage ?? 0}%</strong><small>Across all submitted MCQs</small></div><div className="reference-kpi"><span>Total questions</span><strong>{kpis.totalQuestions ?? data.totals?.answers ?? 0}</strong><small>{period.toLowerCase()}</small></div><div className="reference-kpi"><span>Completed submissions</span><strong>{kpis.submissions ?? data.totals?.submissions ?? 0}</strong><small>{kpis.students ?? data.totals?.students ?? 0} connected students</small></div><div className="reference-kpi"><span>Weakest subject</span><strong className="kpi-text">{kpis.weakSubject || data.aiAnalysis?.weakestSubject?.name || '—'}</strong><small>{data.aiAnalysis?.weakestSubject?.percentage || 0}% average</small></div><div className="reference-kpi"><span>Weakest chapter</span><strong className="kpi-text">{kpis.weakChapter || data.aiAnalysis?.weakestChapter?.name || '—'}</strong><small>{data.aiAnalysis?.weakestChapter?.percentage || 0}% average</small></div></section>
      <section className="reference-chart-grid"><div className="reference-panel trend-panel"><div className="reference-panel-head"><div><span className="eyebrow">Accuracy movement</span><h2>Class accuracy over time</h2></div><span className="chart-caption">{period}</span></div><TrendChart values={dashboard.trend} /></div><div className="reference-panel comparison-panel"><div className="reference-panel-head"><div><span className="eyebrow">Subject comparison</span><h2>Accuracy by subject</h2></div><BarChart3 size={18} /></div><SubjectBars items={subjectBars} active={subjectFilter} onSelect={(name) => setSubjectFilter(subjectFilter === name ? 'All subjects' : name)} /></div><div className="reference-panel distribution-panel-ref"><div className="reference-panel-head"><div><span className="eyebrow">Student distribution</span><h2>Performance bands</h2></div><UsersRound size={18} /></div><DistributionChart items={distribution.length ? distribution : [{ label: 'Needs support', range: '0–59%', count: 4, color: '#c86556' }, { label: 'Watch closely', range: '60–74%', count: 7, color: '#d6a83d' }, { label: 'On track', range: '75–89%', count: 6, color: '#159a90' }, { label: 'Excelling', range: '90–100%', count: 3, color: '#6f8fbe' }]} /></div></section>
      <section className="reference-lower-grid"><div className="reference-panel chapter-analysis"><div className="reference-panel-head"><div><span className="eyebrow">Chapter analysis</span><h2>{subjectFilter === 'All subjects' ? 'Weakest chapters overall' : `${subjectFilter} chapters`}</h2></div><span className="analysis-count">{visibleChapters.length} topics</span></div><div className="chapter-analysis-list">{visibleChapters.slice(0, 8).map((item, index) => <div key={item.label}><span className="chapter-number">{String(index + 1).padStart(2, '0')}</span><div><b>{item.label}</b><small>{item.group}</small><span className="mini-track"><i style={{ width: `${item.value}%` }} /></span></div><strong className={item.value < 60 ? 'weak-value' : ''}>{item.value}%</strong></div>)}</div></div><div className="reference-panel insight-analysis"><div className="reference-panel-head"><div><span className="eyebrow">Gemini teaching brief</span><h2>What to do next</h2></div><BrainCircuit size={18} /></div><div className="insight-callout"><CircleAlert size={17} /><div><b>{data.aiAnalysis?.weakestSubject?.name || 'No weak subject yet'} · {data.aiAnalysis?.weakestSubject?.percentage || 0}%</b><span>{data.aiAnalysis?.teacherSummary || data.insights?.recommendation}</span></div></div><div className="recommendation-list-ref">{(data.aiAnalysis?.recommendations || []).map((item) => <div key={item}><ChevronDown size={14} /><span>{item}</span></div>)}</div><Link href="/dashboard/reports" className="button secondary">Open response reports <ArrowRight size={15} /></Link></div></section>
      <div className="reference-footer"><Target size={15} /><span>Powered by server-scored MCQs and the Gemini analysis contract. Subject and chapter metadata stays hidden from students.</span></div>
    </>}
  </div>;
}
