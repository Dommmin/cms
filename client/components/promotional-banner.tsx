'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useLocalePath } from '@/hooks/use-locale';
import { useActivePromotions } from '@/hooks/use-promotions';
import type { CountdownProps } from './promotional-banner.types';

function Countdown({ endsAt }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        function calc() {
            const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
            if (diff === 0) {
                setExpired(true);
                return;
            }
            setTimeLeft({
                h: Math.floor(diff / 3_600_000),
                m: Math.floor((diff % 3_600_000) / 60_000),
                s: Math.floor((diff % 60_000) / 1000),
            });
        }
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    if (expired) return null;

    return (
        <span className="ml-2 font-mono text-xs font-bold tabular-nums opacity-90">
            {String(timeLeft.h).padStart(2, '0')}:
            {String(timeLeft.m).padStart(2, '0')}:
            {String(timeLeft.s).padStart(2, '0')}
        </span>
    );
}

export function PromotionalBanner() {
    const lp = useLocalePath();
    const { data: promotions } = useActivePromotions();
    const [currentIndex, setCurrentIndex] = useState(0);

    const visiblePromotions = promotions ?? [];

    useEffect(() => {
        if (visiblePromotions.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((i) => (i + 1) % visiblePromotions.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [visiblePromotions.length]);

    if (visiblePromotions.length === 0) return null;

    const promo = visiblePromotions[currentIndex];
    const bgColor = promo.banner_color ?? '#1d4ed8';

    const content = (
        <div
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: bgColor }}
        >
            <span>{promo.banner_text}</span>
            {promo.ends_at && <Countdown endsAt={promo.ends_at} />}
        </div>
    );

    if (promo.banner_url) {
        const isExternal = promo.banner_url.startsWith('http');
        return isExternal ? (
            <a
                href={promo.banner_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
            >
                {content}
            </a>
        ) : (
            <Link href={lp(promo.banner_url)} className="block w-full">
                {content}
            </Link>
        );
    }

    return <div className="w-full">{content}</div>;
}
