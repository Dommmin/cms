'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import type { TurnstileWidgetProps } from './turnstile-widget.types';

const SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ?? '';

/**
 * Cloudflare Turnstile CAPTCHA widget.
 *
 * Renders nothing when NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY is not set,
 * so local development works without Cloudflare credentials.
 */
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
        // Script may already be loaded (e.g. navigating back to the page)
        if (window.turnstile) {
            renderWidget();
        }
        return () => {
            widgetIdRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!SITE_KEY) return null;

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="lazyOnload"
                onLoad={renderWidget}
            />
            <div ref={containerRef} className={className} />
        </>
    );
}
