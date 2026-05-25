'use client';

import { useEffect } from 'react';

export function PwaServiceWorker() {
    useEffect(() => {
        if (
            process.env.NODE_ENV !== 'production' ||
            !('serviceWorker' in navigator)
        ) {
            return;
        }

        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Registration is non-critical; the app must keep working online.
            });
        });
    }, []);

    return null;
}
