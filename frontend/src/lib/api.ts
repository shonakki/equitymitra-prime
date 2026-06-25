/**
 * EquityMitra API Client
 * Typed fetch wrapper with JWT injection, auto-401 handling, and error normalization.
 */

const API_BASE = import.meta.env.VITE_API_BASE as string || "https://equitymitra-prime-production.up.railway.app";
const API_KEY  = import.meta.env.VITE_API_KEY  as string || "";

const JWT_KEY  = "em.jwt";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JWT_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JWT_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem("em.user"); // clear legacy key too
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(API_KEY ? { "x-em-key": API_KEY } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // 401 → clear token and let the app handle redirect
  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  let body: T & { ok?: boolean; error?: string };
  try {
    body = await res.json();
  } catch {
    throw new ApiError(res.status, "Invalid server response");
  }

  if (!res.ok || body.ok === false) {
    throw new ApiError(res.status, (body as { error?: string }).error || "Request failed");
  }

  return body;
}

export const api = {
  get:    <T>(path: string)                             => request<T>(path),
  post:   <T>(path: string, data: unknown)              => request<T>(path, { method: "POST",  body: JSON.stringify(data) }),
  patch:  <T>(path: string, data: unknown)              => request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string)                             => request<T>(path, { method: "DELETE" }),
};

export default api;
