import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:80/api/v1",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function removeToken(): void {
  document.cookie = `${TOKEN_KEY}=; max-age=0; path=/`;
}

// ── Request interceptor: attach Bearer token ─────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: normalise errors ───────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        const localeMatch = document.cookie.match(/(?:^|; )locale=([^;]*)/);
        const locale = localeMatch ? decodeURIComponent(localeMatch[1]) : "en";
        window.location.href = `/${locale}/login`;
      }
    }
    return Promise.reject(error);
  },
);
