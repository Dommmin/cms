'use client';

import { useIsMounted } from '@/hooks/use-is-mounted';
import { useTranslation } from '@/hooks/use-translation';
import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LocaleOption } from './locale-switcher.types';

async function fetchLocales(): Promise<LocaleOption[]> {
    const { data } = await api.get<LocaleOption[]>('/locales');
    return data;
}

export function LocaleSwitcher() {
    const { locale, setLocale } = useTranslation();
    const [open, setOpen] = useState(false);
    const [alignRight, setAlignRight] = useState(true);
    const [direction, setDirection] = useState<'down' | 'up'>('down');
    const mounted = useIsMounted();
    const [position, setPosition] = useState({
        top: 0,
        bottom: 0,
        left: 0,
        width: 0,
    });
    const ref = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);

    const { data: locales, isError } = useQuery({
        queryKey: ['locales'],
        queryFn: fetchLocales,
        staleTime: Infinity,
        retry: 2,
    });

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (
                ref.current &&
                !ref.current.contains(target) &&
                !(menuRef.current && menuRef.current.contains(target))
            ) {
                setOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useLayoutEffect(() => {
        if (!open || !ref.current || !menuRef.current) return;

        const frame = window.requestAnimationFrame(() => {
            const buttonRect = ref.current?.getBoundingClientRect();
            const menuRect = menuRef.current?.getBoundingClientRect();
            if (!buttonRect || !menuRect) return;

            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;
            const menuHeight = menuRect.height;

            setDirection(
                spaceBelow < menuHeight + 16 && spaceAbove > spaceBelow
                    ? 'up'
                    : 'down',
            );

            const fitsRight =
                buttonRect.right + menuRect.width <= window.innerWidth - 8;
            const fitsLeft = buttonRect.left - menuRect.width >= 8;

            if (fitsRight) {
                setAlignRight(false);
            } else if (fitsLeft) {
                setAlignRight(true);
            } else {
                setAlignRight(buttonRect.left > window.innerWidth / 2);
            }

            setPosition({
                top: buttonRect.bottom + 8,
                bottom: window.innerHeight - buttonRect.top + 8,
                left: buttonRect.left,
                width: buttonRect.width,
            });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [open, locales]);

    if (isError || !locales || locales.length <= 1) return null;

    const current = locales.find((l) => l.code === locale) ?? locales[0];

    return (
        <div ref={ref} className="relative" style={{ zIndex: 60 }}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="border-border bg-background text-foreground focus:ring-ring flex cursor-pointer items-center rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`${current.native_name} (${current.code.toUpperCase()})`}
            >
                {current.flag_emoji && (
                    <span className="text-base leading-none">
                        {current.flag_emoji}
                    </span>
                )}
            </button>

            {open && mounted && typeof document !== 'undefined'
                ? createPortal(
                      <ul
                          ref={menuRef}
                          role="listbox"
                          className="border-border bg-background fixed min-w-max overflow-hidden rounded-md border shadow-md"
                          style={{
                              ...(direction === 'up'
                                  ? { bottom: position.bottom }
                                  : { top: position.top }),
                              left: alignRight
                                  ? Math.max(
                                        8,
                                        position.left + position.width - 1,
                                    )
                                  : position.left,
                              zIndex: 210,
                          }}
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
                                      {l.flag_emoji && (
                                          <span className="text-base leading-none">
                                              {l.flag_emoji}
                                          </span>
                                      )}
                                      <span>{l.native_name}</span>
                                  </button>
                              </li>
                          ))}
                      </ul>,
                      document.body,
                  )
                : null}
        </div>
    );
}
