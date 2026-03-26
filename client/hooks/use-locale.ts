'use client';

import { getLocaleFromPath, localePath } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

/** Returns the current locale extracted from the URL pathname. */
export function useLocale(): string {
  const pathname = usePathname();
  return getLocaleFromPath(pathname);
}

/** Returns a helper that prefixes any path with the current locale. */
export function useLocalePath(): (path: string) => string {
  const locale = useLocale();
  return (path: string) => localePath(locale, path);
}
