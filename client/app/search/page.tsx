import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getI18nConfig, resolveLocale } from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';
import { SearchClient } from './_search-client';

export async function generateSearchMetadata(
    locale?: string,
): Promise<Metadata> {
    const i18nConfig = await getI18nConfig();
    const resolvedLocale = locale
        ? await resolveLocale(locale)
        : i18nConfig.defaultLocale;

    return {
        title: 'Search',
        description: 'Search our product catalogue.',
        alternates: generateAlternates('/search', resolvedLocale, i18nConfig),
        robots: 'noindex',
    };
}

export async function generateMetadata(): Promise<Metadata> {
    return generateSearchMetadata();
}

export default function SearchPage() {
    return (
        <Suspense>
            <SearchClient />
        </Suspense>
    );
}
