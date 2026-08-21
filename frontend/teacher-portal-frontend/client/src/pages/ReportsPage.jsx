import { useCallback, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ReportSummary from '../components/reports/ReportSummary.jsx';
import { useApiResource } from '../hooks/useApiResource.jsx';
import { reportService } from '../services/reportService.jsx';
import { DEMO_REPORTS } from '../data/demoReports.jsx';
import { displayValue } from '../utils/safeData.jsx';

export default function ReportsPage() {
  const [selected, setSelected] = useState(null);
  const loader = useCallback(() => reportService.getReports(), []);
  const reports = useApiResource(loader, { initialData: [] });
  const realReports = Array.isArray(reports.data) ? reports.data : reports.data?.reports;
  const showingDemo = !reports.loading && !realReports?.length;
  const list = realReports?.length ? realReports : DEMO_REPORTS;
  const select = async (report) => {
    if (report?.demo || !(report?.id || report?._id)) { setSelected(report); return; }
    try { const data = await reportService.getReport(report.id || report._id); setSelected(data?.report || data); }
    catch (error) { setSelected({ title: 'Unable to open report', summary: error?.message || 'Report details are unavailable.' }); }
  };
  return <div className="page-stack"><PageHeader eyebrow="Reports" title="Read the signal behind the scores." description="Review connected-student submissions and understand how your class is progressing across published quizzes." action={<span className="page-icon"><BarChart3 size={20} /></span>} /><div className="reports-layout"><section className="panel report-list"><div className="panel-heading"><div><span className="eyebrow">Available reports</span><h2>Report library</h2></div><span className="report-count">{list.length} records</span></div>{reports.loading ? <LoadingState label="Loading reports..." /> : <>{showingDemo && <div className="demo-banner"><strong>Preview data only</strong><span>These 20 student records are local UI examples. Real reports will replace them after connected students submit published quizzes.</span></div>}{reports.error && <div className="inline-notice error">Live reports are temporarily unavailable. Showing preview data instead.</div>}{!list.length ? <EmptyState title="No reports available yet." description="Reports will appear after connected students submit quizzes." /> : <div className="report-items">{list.map((report, index) => <button className={`report-item ${selected?.id === report?.id || selected?._id === report?._id ? 'selected' : ''}`} key={report?.id || report?._id || index} onClick={() => select(report)}><span className="report-index">{String(index + 1).padStart(2, '0')}</span><span><strong>{displayValue(report?.title, 'Untitled report')}</strong><small>{displayValue(report?.createdAt || report?.date, 'Date unavailable')}</small></span></button>)}</div>}</>}</section><section className="panel report-detail">{selected ? <ReportSummary report={selected} /> : <EmptyState title="Select a report to begin." description="Your report summary and student performance details will appear here." />}</section></div></div>;
}
