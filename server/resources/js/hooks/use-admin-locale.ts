import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'admin_locale';
const EVENT_NAME = 'admin-locale-changed';

const listeners = new Set<() => void>();

function getStoredLocale(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
}

function subscribe(callback: () => void) {
    listeners.add(callback);
    window.addEventListener(EVENT_NAME, callback);
    return () => {
        listeners.delete(callback);
        window.removeEventListener(EVENT_NAME, callback);
    };
}

export function useAdminLocale(defaultLocale?: string): [string, (locale: string) => void] {
    const locale = useSyncExternalStore(
        subscribe,
        () => getStoredLocale() ?? defaultLocale ?? 'en',
        () => defaultLocale ?? 'en',
    );

    const setLocale = useCallback((newLocale: string): void => {
        localStorage.setItem(STORAGE_KEY, newLocale);
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }, []);

    return [locale, setLocale];
}
