import { DEFAULT_LOCALE, localePath, LOCALES } from '@/lib/i18n';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:8000';

/** Absolute URL for a given locale and path. */
export function absoluteUrl(locale: string, path: string): string {
    const lp = localePath(locale, path);
    return `${SITE_URL}${lp}`;
}

/**
 * Generates Next.js `alternates` metadata object with hreflang entries
 * for all active locales + x-default pointing to the default locale URL.
 */
export function generateAlternates(path: string): Metadata['alternates'] {
    const languages: Record<string, string> = {};

    for (const locale of LOCALES) {
        languages[locale] = absoluteUrl(locale, path);
    }

    return {
        canonical: absoluteUrl(DEFAULT_LOCALE, path),
        languages: {
            ...languages,
            'x-default': absoluteUrl(DEFAULT_LOCALE, path),
        },
    };
}

/** Returns the canonical URL for the given path (default locale). */
export function generateCanonical(path: string): string {
    return absoluteUrl(DEFAULT_LOCALE, path);
}
