import { usePage } from '@inertiajs/react';
import { useAdminLocale } from './use-admin-locale';

type AdminTranslations = Record<string, Record<string, string>>;

/**
 * Returns a translation function `t(key, fallback?)` for admin UI strings.
 * Translations are loaded from the `admin` group in the translations table
 * and shared via Inertia props (`adminTranslations`).
 */
export function useAdminT(): (key: string, fallback?: string) => string {
    const { adminTranslations = {} } = usePage<{ adminTranslations: AdminTranslations }>().props;
    const [locale] = useAdminLocale();

    return (key: string, fallback: string = key): string => {
        return adminTranslations[locale]?.[key]
            ?? adminTranslations['en']?.[key]
            ?? fallback;
    };
}
