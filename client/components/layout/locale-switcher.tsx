'use client';

import { useTranslation } from '@/hooks/use-translation';
import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { LocaleOption } from './locale-switcher.types';

async function fetchLocales(): Promise<LocaleOption[]> {
    const { data } = await api.get<LocaleOption[]>('/locales');
    return data;
}

export function LocaleSwitcher() {
    const { locale, setLocale } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const { data: locales } = useQuery({
        queryKey: ['locales'],
        queryFn: fetchLocales,
        staleTime: Infinity,
    });

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!locales || locales.length <= 1) return null;

    const current = locales.find((l) => l.code === locale) ?? locales[0];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="border-border bg-background text-foreground focus:ring-ring flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
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
                    className="border-border bg-background absolute right-0 z-50 mt-1 min-w-full overflow-hidden rounded-md border shadow-md"
                >
                    {locales.map((l) => (
                        <li
                            key={l.code}
                            role="option"
                            aria-selected={l.code === locale}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setLocale(l.code);
                                    setOpen(false);
                                }}
                                className={`hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-sm ${
                                    l.code === locale
                                        ? 'text-primary font-medium'
                                        : 'text-foreground'
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
