import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const SUPPORTED_LOCALES = new Set(['en', 'pl']);

declare global {
    interface Window {
        __API_URL__?: string;
    }
}

function getBaseURL(): string {
    if (typeof window !== 'undefined') {
        return window.__API_URL__ ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
    }

    return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api/v1';
}

export const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// ── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';
const CSRF_COOKIE_KEY = 'XSRF-TOKEN';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get(TOKEN_KEY) ?? null;
}

export function setToken(token: string): void {
    Cookies.set(TOKEN_KEY, token, {
        expires: 7,
        path: '/',
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
    });
}

export function removeToken(): void {
    Cookies.remove(TOKEN_KEY, { path: '/' });
}

// ── CSRF Token ──────────────────────────────────────────────────────────────

function getCsrfToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return Cookies.get(CSRF_COOKIE_KEY);
}

function getRequestLocale(): string | undefined {
    if (typeof window !== 'undefined') {
        const segment = window.location.pathname.split('/')[1];
        if (SUPPORTED_LOCALES.has(segment)) {
            return segment;
        }
    }

    return 'en';
}

// ── Request interceptor: attach Bearer token + CSRF + locale ─────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF token for state-changing requests (Sanctum)
    const method = config.method?.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method ?? '') && !token) {
        const csrf = getCsrfToken();
        if (csrf) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrf);
        }
    }

    // URL locale is the source of truth; cookie is only a fallback for legacy unprefixed paths.
    const locale = getRequestLocale();
    if (locale) {
        config.params = { locale, ...config.params };
    }

    return config;
});

// ── Response interceptor: normalise errors ───────────────────────────────────

api.interceptors.response.use(
    (response) => response,
    (
        error: AxiosError<{
            message?: string;
            errors?: Record<string, string[]>;
        }>,
    ) => {
        if (error.response?.status === 401) {
            removeToken();
            // Don't redirect for background auth checks — let the UI reflect unauthenticated state naturally.
            // Only redirect when an actual authenticated action fails (checkout, profile, etc.).
            const url = error.config?.url ?? '';
            if (typeof window !== 'undefined' && !url.endsWith('/auth/me')) {
                const locale = Cookies.get('locale') ?? 'en';
                window.location.href = `/${locale}/login`;
            }
        }
        return Promise.reject(error);
    },
);
