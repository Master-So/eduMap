const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://5000-igk8k3bng8y5oux7rc9j7-dfdc0412.us3.manus.computer/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("teacher_portal_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof body === "object" && (body?.error || body?.message) ? (body.error || body.message) : "The request could not be completed.";
    const error = new Error(message); error.status = response.status; throw error;
  }
  return body;
}

export const getApiBaseUrl = () => API_BASE_URL;
