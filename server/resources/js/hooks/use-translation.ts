import { usePage } from '@inertiajs/react';
import { useAdminLocale } from './use-admin-locale';

type AdminTranslations = Record<string, Record<string, string>>;

/**
 * Returns a translation function `__(key, params?, fallback?)` for admin UI strings.
 * Translations are loaded from the `admin` group in the translations table
 * and shared via Inertia props (`adminTranslations`).
 */
export function useTranslation(): (
    key: string,
    params?: Record<string, string | number> | string,
    fallback?: string,
) => string {
    const { adminTranslations = {} } = usePage<{
        adminTranslations: AdminTranslations;
    }>().props;
    const [locale] = useAdminLocale();

    return (
        key: string,
        params?: Record<string, string | number> | string,
        fallback?: string,
    ): string => {
        let resolvedParams: Record<string, string | number> | undefined =
            undefined;
        let resolvedFallback = fallback;

        if (typeof params === 'string') {
            resolvedFallback = params;
        } else {
            resolvedParams = params;
        }

        const defaultFallback =
            typeof resolvedFallback === 'string' ? resolvedFallback : key;

        let translation =
            adminTranslations[locale]?.[key] ??
            adminTranslations['en']?.[key] ??
            defaultFallback;

        if (resolvedParams) {
            Object.entries(resolvedParams).forEach(([k, v]) => {
                translation = translation.replace(
                    new RegExp(`:${k}`, 'g'),
                    String(v),
                );
            });
        }

        return translation;
    };
}
