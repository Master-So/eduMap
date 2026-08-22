import { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Sparkles } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ReportSummary from '../components/reports/ReportSummary.jsx';
import { useApiResource } from '../hooks/useApiResource.jsx';
import { reportService } from '../services/reportService.jsx';
import { displayValue } from '../utils/safeData.jsx';

export default function ReportsPage() {
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const loader = useCallback(() => reportService.getReports(), []);
  const reports = useApiResource(loader, { initialData: [] });
  const realReports = Array.isArray(reports.data) ? reports.data : reports.data?.reports || [];
  const list = realReports;

  const select = async (report) => {
    if (!(report?.id || report?._id)) {
      setSelected(report);
      return;
    }
    setLoadingDetail(true);
    try {
      const data = await reportService.getReport(report.id || report._id);
      setSelected(data?.report || data);
    } catch (error) {
      setSelected({ title: 'Unable to open report', summary: error?.message || 'Report details are unavailable.' });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Auto-select first report when list is loaded if nothing is selected
  useEffect(() => {
    if (list.length > 0 && !selected) {
      select(list[0]);
    }
  }, [list]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Reports"
        title="Read the signal behind the scores."
        description="Review connected-student submissions and understand how your class is progressing across published quizzes."
        action={
          <button
            className="button secondary"
            onClick={() => {
              reports.retry();
              if (selected) select(selected);
            }}
            title="Refresh reports"
          >
            <RefreshCw size={15} /> Refresh Reports
          </button>
        }
      />
      <div className="reports-layout">
        <section className="panel report-list">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Available reports</span>
              <h2>Report library</h2>
            </div>
            <span className="report-count">{list.length} records</span>
          </div>
          {reports.loading ? (
            <LoadingState label="Loading reports..." />
          ) : reports.error ? (
            <div className="inline-notice error">Unable to load live reports: {reports.error}</div>
          ) : !list.length ? (
            <EmptyState
              title="No reports available yet."
              description="Reports and score breakdowns will appear here after connected students submit published quizzes."
            />
          ) : (
            <div className="report-items">
              {list.map((report, index) => {
                const isSelected = selected?.id === report?.id || selected?._id === report?._id || selected?._id === report?.id;
                const subCount = report.submissions ?? report.submissionsCount ?? 0;
                const accuracy = report.averageAccuracy !== undefined ? `${report.averageAccuracy}% Avg` : null;

                return (
                  <button
                    className={`report-item ${isSelected ? 'selected' : ''}`}
                    key={report?.id || report?._id || index}
                    onClick={() => select(report)}
                    style={{ padding: '0.85rem 0.5rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}
                  >
                    <span className="report-index" style={{ paddingTop: '0.1rem' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span style={{ display: 'grid', gap: '0.2rem', width: '100%' }}>
                      <strong style={{ fontSize: '0.82rem', color: isSelected ? 'var(--teal)' : 'var(--ink)' }}>
                        {displayValue(report?.title, 'Assessment Report')}
                      </strong>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.65rem', background: '#eef3f1', padding: '0.15rem 0.45rem', color: 'var(--teal)', fontWeight: 700 }}>
                          {report.subject || 'Curriculum'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--moss)' }}>
                          {subCount} submission{subCount === 1 ? '' : 's'}
                        </span>
                        {accuracy && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--teal)' }}>
                            {accuracy}
                          </span>
                        )}
                      </div>
                      <small style={{ color: 'var(--moss)', fontSize: '0.65rem', marginTop: '0.1rem' }}>
                        {displayValue(report?.createdAt || report?.date, 'Recent')}
                      </small>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
        <section className="panel report-detail" style={{ background: '#fff' }}>
          {loadingDetail ? (
            <LoadingState label="Loading comprehensive report telemetry..." />
          ) : selected ? (
            <ReportSummary report={selected} />
          ) : (
            <EmptyState
              title="Select a report to begin."
              description="Your report summary and student performance details will appear here."
            />
          )}
        </section>
      </div>
    </div>
  );
}
