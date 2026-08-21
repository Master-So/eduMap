import { displayValue } from '../../utils/safeData.jsx';
export default function ReportSummary({ report }) { if (!report) return null; return <div className="report-summary"><span className="eyebrow">AI-generated report</span><h2>{displayValue(report.title, 'Report summary')}</h2><p>{displayValue(report.summary, 'No summary available.')}</p></div>; }
