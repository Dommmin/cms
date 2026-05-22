import { cache } from 'react';

import {
    createI18nConfig,
    FALLBACK_DEFAULT_LOCALE,
    FALLBACK_LOCALES,
    type I18nConfig,
    type Locale,
    type LocaleOption,
} from '@/lib/i18n';
import { serverFetch } from '@/lib/server-fetch';

export const getI18nConfig = cache(async (): Promise<I18nConfig> => {
    const locales = await serverFetch<LocaleOption[]>('/locales', {
        revalidate: 300,
        tags: ['locales'],
    }).catch(() => null);

    if (!locales) {
        return {
            locales: [...FALLBACK_LOCALES],
            defaultLocale: FALLBACK_DEFAULT_LOCALE,
        };
    }

    return createI18nConfig(locales);
});

export async function getDefaultLocale(): Promise<Locale> {
    return (await getI18nConfig()).defaultLocale;
}

export async function getNonDefaultLocales(): Promise<Locale[]> {
    const config = await getI18nConfig();

    return config.locales.filter((locale) => locale !== config.defaultLocale);
}

export async function resolveLocale(rawLocale: string): Promise<Locale> {
    const config = await getI18nConfig();

    return config.locales.includes(rawLocale)
        ? rawLocale
        : config.defaultLocale;
}
