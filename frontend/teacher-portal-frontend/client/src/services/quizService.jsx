import { apiRequest } from './api.jsx';

export const quizService = {
  generateQuiz: (payload) => apiRequest('/teacher/quizzes/generate', { method: 'POST', body: JSON.stringify(payload) }),
  publishQuiz: (id) => apiRequest(`/teacher/quizzes/${encodeURIComponent(id)}/publish`, { method: 'POST' }),
  getQuizHistory: () => apiRequest('/teacher/quizzes'),
  createQuiz: (payload) => apiRequest('/teacher/quizzes', { method: 'POST', body: JSON.stringify(payload) }),
};
