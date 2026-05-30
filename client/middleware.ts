import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const FALLBACK_LOCALES = ['pl', 'en'];
const FALLBACK_DEFAULT_LOCALE = 'pl';
const API_URL =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://nginx/api/v1';

interface I18nConfig {
    locales: string[];
    defaultLocale: string;
}

interface LocalePayload {
    code: string;
    is_default: boolean;
}

let cachedI18nConfig: { value: I18nConfig; expiresAt: number } | null = null;

/**
 * Paths that are user-session-specific and should NOT carry a locale prefix.
 * When a non-default locale prefix is present (e.g. /pl/cart), the locale is
 * stripped via a rewrite so the root route handles the request.
 */
const SESSION_PATHS = [
    '/cart',
    '/checkout',
    '/account',
    '/login',
    '/register',
    '/forgot-password',
    '/newsletter',
    '/wishlist',
];

function isSessionPath(path: string): boolean {
    return SESSION_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

async function getI18nConfig(): Promise<I18nConfig> {
    const now = Date.now();
    if (cachedI18nConfig && cachedI18nConfig.expiresAt > now) {
        return cachedI18nConfig.value;
    }

    try {
        const response = await fetch(`${API_URL}/locales`, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(2000),
        });

        if (!response.ok) {
            throw new Error(`Locales fetch failed: ${response.status}`);
        }

        const locales = (await response.json()) as LocalePayload[];
        const activeLocales = locales
            .map((locale) => locale.code)
            .filter(Boolean);
        const defaultLocale =
            locales.find((locale) => locale.is_default)?.code ??
            activeLocales[0] ??
            FALLBACK_DEFAULT_LOCALE;
        const value = {
            locales: activeLocales.length ? activeLocales : FALLBACK_LOCALES,
            defaultLocale,
        };

        cachedI18nConfig = {
            value,
            expiresAt: now + 5 * 60 * 1000,
        };

        return value;
    } catch {
        return {
            locales: FALLBACK_LOCALES,
            defaultLocale: FALLBACK_DEFAULT_LOCALE,
        };
    }
}

function setLocaleCookie(response: NextResponse, locale: string): void {
    response.cookies.set('locale', locale, {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
    });
}

function generateNonce(): string {
    // Use Web Crypto API (available in Edge Runtime)
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

function getCspHeader(nonce: string): string {
    const isDev = process.env.NODE_ENV === 'development';
    const frameAncestors = isDev
        ? "frame-ancestors 'self' http://localhost:*"
        : "frame-ancestors 'self'";

    return [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com ${isDev ? "'unsafe-eval'" : ''}`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
        `img-src 'self' data: blob: https: ${isDev ? 'http:' : ''}`,
        `font-src 'self' https://fonts.gstatic.com`,
        `connect-src 'self' https: ${isDev ? 'http://localhost:*' : ''}`,
        `frame-src 'self' https://www.google.com`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        frameAncestors,
        `upgrade-insecure-requests`,
    ]
        .filter(Boolean)
        .join('; ');
}

export async function middleware(request: NextRequest) {
    const nonce = generateNonce();
    const { locales, defaultLocale } = await getI18nConfig();
    const { pathname } = request.nextUrl;
    const pathLocale = pathname.split('/')[1] ?? '';

    // Case 1: Explicit default locale prefix (/pl/...) → 301 redirect to clean URL
    if (pathLocale === defaultLocale) {
        const cleanPath =
            pathname === `/${defaultLocale}`
                ? '/'
                : pathname.slice(defaultLocale.length + 1);
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = cleanPath;
        const response = NextResponse.redirect(redirectUrl, 301);
        setLocaleCookie(response, defaultLocale);
        response.headers.set('Content-Security-Policy', getCspHeader(nonce));
        response.headers.set('x-nonce', nonce);
        return response;
    }

    // Case 2: Non-default locale prefix (/en/..., /de/...)
    if (locales.includes(pathLocale)) {
        const pathAfterLocale = pathname.slice(pathLocale.length + 1) || '/';
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-locale', pathLocale);
        requestHeaders.set('x-nonce', nonce);

        // Session-only paths (cart, checkout, account…): rewrite to strip locale
        // so they are always served from root routes regardless of locale prefix.
        if (isSessionPath(pathAfterLocale)) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = pathAfterLocale;
            const response = NextResponse.rewrite(rewriteUrl, {
                request: { headers: requestHeaders },
            });
            setLocaleCookie(response, pathLocale);
            response.headers.set(
                'Content-Security-Policy',
                getCspHeader(nonce),
            );
            return response;
        }

        // Locale-aware paths: keep URL intact — Next.js routes to app/[locale]/.
        const response = NextResponse.next({
            request: { headers: requestHeaders },
        });
        setLocaleCookie(response, pathLocale);
        response.headers.set('Content-Security-Policy', getCspHeader(nonce));
        return response;
    }

    // Case 3: No locale prefix → this IS the default locale URL.
    // For first-time visitors (no cookie yet), check Accept-Language and redirect.
    if (!request.cookies.get('locale')) {
        const acceptLang = request.headers.get('accept-language') ?? '';
        const preferred =
            acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() ?? '';
        if (locales.includes(preferred) && preferred !== defaultLocale) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
            const response = NextResponse.redirect(redirectUrl);
            response.headers.set(
                'Content-Security-Policy',
                getCspHeader(nonce),
            );
            return response;
        }
    }

    // Default locale — set x-locale header + cookie.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', defaultLocale);
    requestHeaders.set('x-nonce', nonce);
    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });
    setLocaleCookie(response, defaultLocale);
    response.headers.set('Content-Security-Policy', getCspHeader(nonce));
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)', '/'],
};
