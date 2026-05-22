import { getRuntimeI18nConfig, localePath, type I18nConfig } from '@/lib/i18n';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:8000';

/** Absolute URL for a given locale and path. */
export function absoluteUrl(
    locale: string,
    path: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): string {
    const lp = localePath(locale, path, config);
    return `${SITE_URL}${lp}`;
}

/**
 * Generates Next.js `alternates` metadata object with hreflang entries
 * for all active locales + x-default pointing to the default locale URL.
 */
export function generateAlternates(
    path: string,
    locale: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): Metadata['alternates'] {
    const languages: Record<string, string> = {};

    for (const locale of config.locales) {
        languages[locale] = absoluteUrl(locale, path, config);
    }

    return {
        canonical: absoluteUrl(locale, path, config),
        languages: {
            ...languages,
            'x-default': absoluteUrl(config.defaultLocale, path, config),
        },
    };
}

/** Returns the canonical URL for the given path (default locale). */
export function generateCanonical(
    path: string,
    config: I18nConfig = getRuntimeI18nConfig(),
): string {
    return absoluteUrl(config.defaultLocale, path, config);
}

export function localizedBlogPath(
    locale: string,
    slugs: Record<string, string> | undefined,
    fallbackSlug: string,
): string {
    return `/blog/${slugs?.[locale] ?? fallbackSlug}`;
}
