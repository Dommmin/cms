export const FALLBACK_LOCALES = ['pl', 'en'] as const;
export const FALLBACK_DEFAULT_LOCALE = 'pl';

export type Locale = string;

export interface LocaleOption {
    code: string;
    name?: string;
    native_name?: string;
    flag_emoji?: string;
    is_default: boolean;
}

export interface I18nConfig {
    locales: string[];
    defaultLocale: string;
}

export const LOCALES = FALLBACK_LOCALES;
export const DEFAULT_LOCALE: Locale = FALLBACK_DEFAULT_LOCALE;

export function createI18nConfig(locales: LocaleOption[]): I18nConfig {
    const activeLocales = locales.map((locale) => locale.code).filter(Boolean);
    const defaultLocale =
        locales.find((locale) => locale.is_default)?.code ??
        activeLocales[0] ??
        FALLBACK_DEFAULT_LOCALE;

    return {
        locales: activeLocales.length ? activeLocales : [...FALLBACK_LOCALES],
        defaultLocale,
    };
}

export function getRuntimeI18nConfig(): I18nConfig {
    if (typeof window !== 'undefined') {
        const raw = document.documentElement.dataset.i18n;
        if (raw) {
            try {
                return JSON.parse(raw) as I18nConfig;
            } catch {
                // malformed data attribute — fall through
            }
        }
    }

    return {
        locales: [...FALLBACK_LOCALES],
        defaultLocale: FALLBACK_DEFAULT_LOCALE,
    };
}

export function isValidLocale(
    s: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): s is Locale {
    return config.locales.includes(s);
}

/** Extract locale from pathname: '/en/products' → 'en' */
export function getLocaleFromPath(
    pathname: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): Locale {
    const segment = pathname.split('/')[1] ?? '';
    return isValidLocale(segment, config) ? segment : config.defaultLocale;
}

export function getExplicitLocaleFromPath(
    pathname: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): Locale | null {
    const segment = pathname.split('/')[1] ?? '';
    return isValidLocale(segment, config) ? segment : null;
}

/** Strip locale prefix: '/en/products' → '/products', '/en' → '/' */
export function stripLocaleFromPath(
    pathname: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): string {
    const locale = getLocaleFromPath(pathname, config);
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`))
        return pathname.slice(locale.length + 1);
    return pathname;
}

/**
 * Build locale-prefixed path.
 * Default locale uses no prefix; non-default locales are prefixed.
 */
export function localePath(
    locale: string,
    path: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (locale === config.defaultLocale) return normalized || '/';
    return `/${locale}${normalized === '/' ? '' : normalized}`;
}
