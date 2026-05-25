'use client';

import { useLayoutEffect } from 'react';

export function ThemeInit() {
    useLayoutEffect(() => {
        const theme = localStorage.getItem('theme') || 'system';
        const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)',
        ).matches;

        if (theme === 'dark' || (theme === 'system' && prefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return null;
}
