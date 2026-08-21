import { apiRequest } from './api.jsx';

export const reportService = {
  getReports: () => apiRequest('/teacher/reports'),
  getReport: (id) => apiRequest(`/teacher/reports/${encodeURIComponent(id)}`),
  getAnalytics: () => apiRequest('/teacher/analytics'),
  analyzeAnalytics: () => apiRequest('/teacher/analytics/analyze', { method: 'POST' }),
};
