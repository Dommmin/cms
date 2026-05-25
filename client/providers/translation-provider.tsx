'use client';

import { getTranslations } from '@/api/translations';
import { getLocaleFromPath, localePath, stripLocaleFromPath } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { createContext, useCallback } from 'react';

import type {
    TranslationContextType,
    TranslationProviderProps,
} from './translation-provider.types';

export const TranslationContext = createContext<TranslationContextType | null>(
    null,
);

export function TranslationProvider({ children }: TranslationProviderProps) {
    const pathname = usePathname();

    const currentLocale = getLocaleFromPath(pathname);

    const { data: translations, isLoading } = useQuery({
        queryKey: ['translations', currentLocale],
        queryFn: () => getTranslations(currentLocale),
        staleTime: 1000 * 60 * 60,
    });

    const t = useCallback(
        (key: string, fallback?: string): string => {
            if (!translations) return fallback ?? key;
            return translations[key] ?? fallback ?? key;
        },
        [translations],
    );

    const setLocale = useCallback(
        (newLocale: string) => {
            // Use hard navigation so server components (Header, menu) fully re-render
            // with the new locale. router.push() only re-renders page segments, not layouts.
            const pathWithoutLocale = stripLocaleFromPath(pathname);
            window.location.href = localePath(newLocale, pathWithoutLocale);
        },
        [pathname],
    );

    return (
        <TranslationContext.Provider
            value={{ t, locale: currentLocale, setLocale, isLoading }}
        >
            {children}
        </TranslationContext.Provider>
    );
}
