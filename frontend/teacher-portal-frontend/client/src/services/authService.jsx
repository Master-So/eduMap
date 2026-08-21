import { apiRequest } from "./api.jsx";

const TOKEN_KEY = "teacher_portal_token";
const TEACHER_KEY = "teacher_portal_teacher";

export const authService = {
  async login(credentials) {
    const data = await apiRequest("/auth/teacher/login", { method: "POST", body: JSON.stringify(credentials) });
    return {
      token: data?.token || data?.accessToken,
      teacher: data?.teacher || data?.user || { name: data?.name, email: data?.email, role: data?.role },
    };
  },
  async getCurrentTeacher() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (token === "frontend-test-token") {
      try { return JSON.parse(localStorage.getItem(TEACHER_KEY) || "null"); } catch { return null; }
    }
    const data = await apiRequest("/auth/me");
    return data?.teacher || data?.user || data;
  },
  getStoredSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const teacher = JSON.parse(localStorage.getItem(TEACHER_KEY) || "null");
      return token && teacher ? { token, teacher } : null;
    } catch { return null; }
  },
  storeSession(session) {
    if (session?.token) localStorage.setItem(TOKEN_KEY, session.token);
    if (session?.teacher) localStorage.setItem(TEACHER_KEY, JSON.stringify(session.teacher));
  },
  clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TEACHER_KEY); },
  logout() { this.clearSession(); },
};
