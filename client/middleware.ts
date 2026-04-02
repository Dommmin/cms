import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const LOCALES = ['en', 'pl'];
const DEFAULT_LOCALE = 'en';

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
];

function isSessionPath(path: string): boolean {
    return SESSION_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

function setLocaleCookie(response: NextResponse, locale: string): void {
    response.cookies.set('locale', locale, {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
    });
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const pathLocale = pathname.split('/')[1] ?? '';

    // Case 1: Explicit default locale prefix (/en/...) → 301 redirect to clean URL
    if (pathLocale === DEFAULT_LOCALE) {
        const cleanPath =
            pathname === `/${DEFAULT_LOCALE}`
                ? '/'
                : pathname.slice(DEFAULT_LOCALE.length + 1);
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = cleanPath;
        const response = NextResponse.redirect(redirectUrl, 301);
        setLocaleCookie(response, DEFAULT_LOCALE);
        return response;
    }

    // Case 2: Non-default locale prefix (/pl/..., /de/...)
    if (LOCALES.includes(pathLocale)) {
        const pathAfterLocale = pathname.slice(pathLocale.length + 1) || '/';
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-locale', pathLocale);

        // Session-only paths (cart, checkout, account…): rewrite to strip locale
        // so they are always served from root routes regardless of locale prefix.
        if (isSessionPath(pathAfterLocale)) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = pathAfterLocale;
            const response = NextResponse.rewrite(rewriteUrl, {
                request: { headers: requestHeaders },
            });
            setLocaleCookie(response, pathLocale);
            return response;
        }

        // Locale-aware paths: keep URL intact — Next.js routes to app/[locale]/.
        const response = NextResponse.next({
            request: { headers: requestHeaders },
        });
        setLocaleCookie(response, pathLocale);
        return response;
    }

    // Case 3: No locale prefix → this IS the default locale URL.
    // For first-time visitors (no cookie yet), check Accept-Language and redirect.
    if (!request.cookies.get('locale')) {
        const acceptLang = request.headers.get('accept-language') ?? '';
        const preferred =
            acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() ?? '';
        if (LOCALES.includes(preferred) && preferred !== DEFAULT_LOCALE) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Default locale — set x-locale header + cookie.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', DEFAULT_LOCALE);
    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });
    setLocaleCookie(response, DEFAULT_LOCALE);
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)', '/'],
};
