// API Client configuration - Backend runs on port 5001
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Token Management
export const getAuthToken = () => localStorage.getItem('edu_student_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('edu_student_token', token);
  else localStorage.removeItem('edu_student_token');
};

export const getStudentUser = () => {
  try {
    const raw = localStorage.getItem('edu_student_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStudentUser = (user) => {
  if (user) localStorage.setItem('edu_student_user', JSON.stringify(user));
  else localStorage.removeItem('edu_student_user');
};

export const clearAuth = () => {
  localStorage.removeItem('edu_student_token');
  localStorage.removeItem('edu_student_user');
};

// Generic Fetch Wrapper
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err);
    throw err;
  }
}

// Auth API
export const authApi = {
  login: async (email, password) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        role: 'student', // Strictly hardcoded
      }),
    });
  },

  getCurrentUser: async () => {
    return request('/api/auth/me');
  },
};

// Student API (Connection Key, Quizzes, Submissions)
export const studentApi = {
  connectToTeacher: async (teacherConnectionKey) => {
    return request('/api/students/connect', {
      method: 'POST',
      body: JSON.stringify({ teacherConnectionKey }),
    });
  },

  getPublishedQuizzes: async () => {
    return request('/api/students/quizzes');
  },

  getPublishedQuiz: async (id) => {
    return request(`/api/students/quizzes/${id}`);
  },

  getQuizResult: async (id) => {
    return request(`/api/students/quizzes/${id}/result`);
  },

  submitQuiz: async (id, answers) => {
    return request(`/api/students/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  getSubmissions: async () => {
    return request('/api/students/submissions');
  },
};


// Local Submission & Dynamic Analytics Calculation
export const submissionStorage = {
  saveSubmission: (studentId, submissionData) => {
    const key = `edu_submissions_${studentId || 'default'}`;
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({
        ...submissionData,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to save submission locally:', e);
    }
  },

  getSubmissions: (studentId) => {
    const key = `edu_submissions_${studentId || 'default'}`;
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  },

  calculateAnalytics: (submissions = []) => {
    if (!submissions || submissions.length === 0) {
      return {
        hasData: false,
        overallAccuracy: 0,
        quizzesCompleted: 0,
        strongestSubject: 'No tests yet',
        weakestTopic: 'No tests yet',
        trendPoints: [],
        subjectWise: [],
        aiRecommendations: [],
      };
    }

    let totalScore = 0;
    let totalQuestions = 0;
    const subjectStats = {};
    const topicStats = {};

    submissions.forEach((sub) => {
      totalScore += Number(sub.score || 0);
      totalQuestions += Number(sub.total || sub.totalQuestions || 0);

      const subj = sub.subject || 'General';
      if (!subjectStats[subj]) {
        subjectStats[subj] = { correct: 0, total: 0 };
      }
      subjectStats[subj].correct += Number(sub.score || 0);
      subjectStats[subj].total += Number(sub.total || sub.totalQuestions || 0);

      if (Array.isArray(sub.answers || sub.review)) {
        const answerList = sub.answers || sub.review;
        answerList.forEach((ans) => {
          const t = ans.topic || ans.topicTag || 'General Concept';
          if (!topicStats[t]) {
            topicStats[t] = { correct: 0, total: 0 };
          }
          if (ans.isCorrect) topicStats[t].correct += 1;
          topicStats[t].total += 1;
        });
      }
    });

    const overallAccuracy = totalQuestions > 0 
      ? Math.round((totalScore / totalQuestions) * 100) 
      : 0;

    // Subject breakdown
    const subjectWise = Object.keys(subjectStats).map((subjName) => {
      const s = subjectStats[subjName];
      const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      return { name: subjName, percentage: pct, correct: s.correct, total: s.total };
    }).sort((a, b) => b.percentage - a.percentage);

    // Topic breakdown
    const topicList = Object.keys(topicStats).map((tName) => {
      const t = topicStats[tName];
      const pct = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      return { name: tName, percentage: pct, correct: t.correct, total: t.total };
    }).sort((a, b) => a.percentage - b.percentage);

    const strongestSubject = subjectWise.length > 0
      ? `${subjectWise[0].name} (${subjectWise[0].percentage}%)`
      : 'No tests yet';

    const weakestTopic = topicList.length > 0
      ? `${topicList[0].name} (${topicList[0].percentage}%)`
      : 'No tests yet';

    const trendPoints = submissions.map((s) => Number(s.percentage || 0));

    // Dynamic AI Recommendations based on real missed topics
    const aiRecommendations = [];
    const weakTopics = topicList.filter((t) => t.percentage < 80);

    if (weakTopics.length > 0) {
      weakTopics.slice(0, 3).forEach((w, idx) => {
        aiRecommendations.push({
          id: `rec_${idx}`,
          title: `Focus Review on ${w.name}`,
          description: `Your recorded accuracy on ${w.name} is ${w.percentage}% (${w.correct}/${w.total} questions correct). Review core principles before your next assessment.`,
          action: `Complete practice questions on ${w.name} to lift subject mastery.`,
        });
      });
    } else if (subjectWise.length > 0) {
      aiRecommendations.push({
        id: 'rec_mastery',
        title: `Consistent Mastery across ${subjectWise[0].name}`,
        description: `You maintained high accuracy (${subjectWise[0].percentage}%) across ${subjectWise[0].name}. Continue regular revision.`,
        action: 'Attempt more advanced problem sets.',
      });
    }

    return {
      hasData: true,
      overallAccuracy,
      quizzesCompleted: submissions.length,
      strongestSubject,
      weakestTopic,
      trendPoints,
      subjectWise,
      aiRecommendations,
    };
  }
};
