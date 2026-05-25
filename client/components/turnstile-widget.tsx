'use client';

import { useEffect, useRef } from 'react';
import type { TurnstileWidgetProps } from './turnstile-widget.types';

const SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ?? '';

export function TurnstileWidget({
    onVerify,
    onExpire,
    className,
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    function renderWidget() {
        if (!containerRef.current || widgetIdRef.current || !window.turnstile) {
            return;
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: onVerify,
            'expired-callback': onExpire,
            theme: 'auto',
        });
    }

    useEffect(() => {
        if (!SITE_KEY) return;

        if (window.turnstile) {
            renderWidget();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.onload = renderWidget;
        document.head.appendChild(script);

        return () => {
            widgetIdRef.current = null;
            document.head.removeChild(script);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!SITE_KEY) return null;

    return <div ref={containerRef} className={className} />;
}
