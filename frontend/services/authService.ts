import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/v1"
    : "https://kelana-ai-343669a3.fastapicloud.dev/api/v1");

const TOKEN_KEY = "kelanai_token";
const USER_KEY = "kelanai_user";

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Registration failed");
  }
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }
  return data;
}

export function saveSession(auth: AuthResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, auth.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function toAuthUrl(next?: string): string {
  const base = "/login";
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}

export async function getCurrentUser(): Promise<AuthResponse["user"] | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}