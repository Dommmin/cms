import type { Metadata } from 'next';

import { getI18nConfig, resolveLocale } from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';

export async function generateStoresMetadata(
    locale?: string,
): Promise<Metadata> {
    const i18nConfig = await getI18nConfig();
    const resolvedLocale = locale
        ? await resolveLocale(locale)
        : i18nConfig.defaultLocale;

    return {
        title: 'Store Locations',
        description: 'Find our stores near you.',
        alternates: generateAlternates('/stores', resolvedLocale, i18nConfig),
    };
}
