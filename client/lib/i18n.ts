export const LOCALES = ['en', 'pl'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isValidLocale(s: string): s is Locale {
  return (LOCALES as readonly string[]).includes(s);
}

/** Extract locale from pathname: '/en/products' → 'en' */
export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split('/')[1] ?? '';
  return isValidLocale(segment) ? segment : DEFAULT_LOCALE;
}

/** Strip locale prefix: '/en/products' → '/products', '/en' → '/' */
export function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (pathname === `/${locale}`) return '/';
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  return pathname;
}

/**
 * Build locale-prefixed path.
 * Default locale (en) uses no prefix: (en, /products) → '/products'
 * Non-default locale: (pl, /products) → '/pl/products'
 */
export function localePath(locale: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized || '/';
  return `/${locale}${normalized === '/' ? '' : normalized}`;
}
