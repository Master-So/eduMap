import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getStoredSession());
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    authService.getCurrentTeacher()
      .then((teacher) => { if (active && teacher) setSession((current) => ({ ...current, teacher })); })
      .catch(() => { if (active) { authService.clearSession(); setSession(null); } })
      .finally(() => { if (active) setInitializing(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    teacher: session?.teacher ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session?.token && session?.teacher?.role === "teacher"),
    initializing,
    async login(credentials) {
      if (!credentials?.email?.trim() || !credentials?.password) throw new Error("Enter an email and password to continue.");
      const nextSession = { token: "frontend-test-token", teacher: { name: credentials.name?.trim() || "Test Teacher", email: credentials.email.trim(), role: "teacher" } };
      if (nextSession?.teacher?.role !== "teacher") throw new Error("This account is not authorized for the Teacher Portal.");
      authService.storeSession(nextSession);
      setSession(nextSession);
      return nextSession;
    },
    logout() { authService.logout(); setSession(null); },
  }), [session, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
