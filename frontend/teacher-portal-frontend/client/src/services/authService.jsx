import { apiRequest } from "./api.jsx";

const TOKEN_KEY = "teacher_portal_token";
const TEACHER_KEY = "teacher_portal_teacher";

export const authService = {
  async login(credentials) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials?.email?.trim(),
        password: credentials?.password,
      }),
    });

    const role = data?.role || data?.user?.role || data?.teacher?.role;
    if (role && role !== "teacher") {
      throw new Error("This account is registered as a student. Please log in with a teacher account.");
    }

    const token = data?.token || data?.accessToken;
    const teacher = data?.teacher || data?.user || {
      _id: data?._id || data?.id,
      name: data?.name,
      email: data?.email,
      role: data?.role || "teacher",
      connectionKey: data?.connectionKey,
    };

    const session = { token, teacher };
    this.storeSession(session);
    return session;
  },

  async register(userData) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: userData?.name?.trim(),
        email: userData?.email?.trim(),
        password: userData?.password,
        role: "teacher",
      }),
    });

    const token = data?.token || data?.accessToken;
    const teacher = data?.teacher || data?.user || {
      _id: data?._id || data?.id,
      name: data?.name,
      email: data?.email,
      role: data?.role || "teacher",
      connectionKey: data?.connectionKey,
    };

    const session = { token, teacher };
    this.storeSession(session);
    return session;
  },

  async getCurrentTeacher() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const data = await apiRequest("/auth/me");
      const teacher = data?.teacher || data?.user || data;
      if (teacher) {
        localStorage.setItem(TEACHER_KEY, JSON.stringify(teacher));
      }
      return teacher;
    } catch {
      this.clearSession();
      return null;
    }
  },

  getStoredSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const teacher = JSON.parse(localStorage.getItem(TEACHER_KEY) || "null");
      return token && teacher ? { token, teacher } : null;
    } catch {
      return null;
    }
  },

  storeSession(session) {
    if (session?.token) localStorage.setItem(TOKEN_KEY, session.token);
    if (session?.teacher) localStorage.setItem(TEACHER_KEY, JSON.stringify(session.teacher));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TEACHER_KEY);
  },

  logout() {
    this.clearSession();
  },
};

