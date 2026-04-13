'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import type { Theme } from './theme-toggle.types';

function applyTheme(theme: Theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function getThemeSnapshot(): Theme {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function subscribeToTheme(callback: () => void): () => void {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', callback);
    window.addEventListener('storage', callback);
    return () => {
        mq.removeEventListener('change', callback);
        window.removeEventListener('storage', callback);
    };
}

export function ThemeToggle() {
    const theme = useSyncExternalStore<Theme | null>(
        subscribeToTheme,
        getThemeSnapshot,
        () => null,
    );

    useEffect(() => {
        if (theme) applyTheme(theme);
    }, [theme]);

    function toggle() {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
        window.dispatchEvent(new StorageEvent('storage'));
    }

    if (theme === null) {
        return (
            <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-md"
                aria-hidden="true"
            />
        );
    }

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-md"
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
            )}
        </button>
    );
}
