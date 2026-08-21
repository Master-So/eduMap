import { apiRequest } from './api.jsx';
export const studentService = {
  getConnectedStudents: () => apiRequest('/teacher/students'),
  getConnectionKey: () => apiRequest('/teacher/connection-key'),
  getPublishedQuizzes: () => apiRequest('/students/quizzes'),
  getPublishedQuiz: (id) => apiRequest(`/students/quizzes/${encodeURIComponent(id)}`),
  submitQuiz: (id, answers) => apiRequest(`/students/quizzes/${encodeURIComponent(id)}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
};
