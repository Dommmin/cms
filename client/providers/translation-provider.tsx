"use client";

import { createContext, useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTranslations } from "@/api/translations";
import { getLocaleFromPath, localePath, stripLocaleFromPath } from "@/lib/i18n";

type TranslationContextType = {
  t: (key: string, fallback?: string) => string;
  locale: string;
  setLocale: (locale: string) => void;
  isLoading: boolean;
};

export const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Derive locale from URL (source of truth). Fall back to prop on initial SSR render.
  const localeFromPath = getLocaleFromPath(pathname);
  const [locale, setLocaleState] = useState<string>(
    localeFromPath !== "en" ? localeFromPath : (initialLocale ?? "en")
  );

  // Keep state in sync when URL changes (e.g. browser back/forward)
  const currentLocale = localeFromPath !== "en" ? localeFromPath : locale;

  const { data: translations, isLoading } = useQuery({
    queryKey: ["translations", currentLocale],
    queryFn: () => getTranslations(currentLocale),
    staleTime: 1000 * 60 * 60,
  });

  const t = useCallback(
    (key: string, fallback?: string): string => {
      if (!translations) return fallback ?? key;
      return translations[key] ?? fallback ?? key;
    },
    [translations]
  );

  const setLocale = useCallback(
    (newLocale: string) => {
      setLocaleState(newLocale);
      // Navigate to the same page but with the new locale prefix
      const pathWithoutLocale = stripLocaleFromPath(pathname);
      router.push(localePath(newLocale, pathWithoutLocale));
    },
    [pathname, router]
  );

  return (
    <TranslationContext.Provider value={{ t, locale: currentLocale, setLocale, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}
