"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: locales } = useQuery({
    queryKey: ["locales"],
    queryFn: fetchLocales,
    staleTime: Infinity,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!locales || locales.length <= 1) return null;

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        {current.flag_emoji && <span>{current.flag_emoji}</span>}
        <span>{current.native_name}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-full overflow-hidden rounded-md border border-border bg-background shadow-md"
        >
          {locales.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === locale}>
              <button
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent ${
                  l.code === locale ? "font-medium text-primary" : "text-foreground"
                }`}
              >
                {l.flag_emoji && <span>{l.flag_emoji}</span>}
                <span>{l.native_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
