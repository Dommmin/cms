"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useTranslation } from "@/hooks/use-translation";

type LocaleOption = {
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string | null;
};

async function fetchLocales(): Promise<LocaleOption[]> {
  const { data } = await api.get<LocaleOption[]>("/locales");
  return data;
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useTranslation();

  const { data: locales } = useQuery({
    queryKey: ["locales"],
    queryFn: fetchLocales,
    staleTime: Infinity,
  });

  if (!locales || locales.length <= 1) return null;

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="cursor-pointer appearance-none rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Select language"
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag_emoji} {l.native_name}
        </option>
      ))}
    </select>
  );
}
