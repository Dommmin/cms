import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['en', 'pl'];
const DEFAULT_LOCALE = 'en';

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get('accept-language') ?? '';
  const preferred = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() ?? '';
  if (LOCALES.includes(preferred)) return preferred;

  return DEFAULT_LOCALE;
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
      pathname === `/${DEFAULT_LOCALE}` ? '/' : pathname.slice(DEFAULT_LOCALE.length + 1);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = cleanPath;
    const response = NextResponse.redirect(redirectUrl, 301);
    setLocaleCookie(response, DEFAULT_LOCALE);
    return response;
  }

  // Case 2: Non-default locale prefix (/pl/...) → rewrite internally + set cookie
  if (LOCALES.includes(pathLocale)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname =
      pathname === `/${pathLocale}` ? '/' : pathname.slice(pathLocale.length + 1);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', pathLocale);
    const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    setLocaleCookie(response, pathLocale);
    return response;
  }

  // Case 3: No locale prefix → default locale; set cookie and pass through
  const detectedLocale = detectLocale(request);

  // If user's preferred locale is non-default, redirect to locale-prefixed URL
  if (detectedLocale !== DEFAULT_LOCALE && !request.cookies.get('locale')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  // Default locale — pass through, just refresh the cookie
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', detectedLocale);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  setLocaleCookie(response, detectedLocale);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)', '/'],
};
