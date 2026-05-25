'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { initConsentMode, trackPageView } from '@/lib/datalayer';
import type { GoogleTagManagerProps } from './google-tag-manager.types';

export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
    const pathname = usePathname();

    useEffect(() => {
        initConsentMode();

        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({
            'gtm.start': Date.now(),
            event: 'gtm.js',
        });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [gtmId]);

    useEffect(() => {
        trackPageView(pathname, document.title);
    }, [pathname]);

    return (
        <noscript>
            <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
            />
        </noscript>
    );
}
