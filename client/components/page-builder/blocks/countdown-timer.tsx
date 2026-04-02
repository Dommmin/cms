'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import type {
    CountdownTimerConfig,
    CountdownTimerProps,
} from './countdown-timer.types';

function pad(n: number) {
    return String(n).padStart(2, '0');
}

export function CountdownTimerBlock({ block }: CountdownTimerProps) {
    const cfg = block.configuration as CountdownTimerConfig;
    const targetDate = cfg.target_date ? new Date(cfg.target_date) : null;

    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        if (!targetDate || isNaN(targetDate.getTime())) return;

        const tick = () => {
            const diff = targetDate.getTime() - Date.now();
            if (diff <= 0) {
                setExpired(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft({ days, hours, minutes, seconds });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [cfg.target_date]); // eslint-disable-line react-hooks/exhaustive-deps

    const isDark = cfg.style === 'dark' || cfg.style === 'brand';
    const containerClass = {
        light: 'bg-background text-foreground',
        dark: 'bg-gray-950 text-white rounded-2xl px-8 py-12',
        brand: 'bg-primary text-primary-foreground rounded-2xl px-8 py-12',
    }[cfg.style ?? 'dark'];

    return (
        <div
            className={`flex flex-col items-center gap-8 text-center ${containerClass}`}
        >
            {cfg.title && (
                <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>
            )}
            {cfg.subtitle && (
                <p
                    className={`text-lg ${isDark ? 'opacity-80' : 'text-muted-foreground'}`}
                >
                    {cfg.subtitle}
                </p>
            )}

            {expired ? (
                <p className="text-xl font-semibold">
                    {cfg.expired_message ?? 'This offer has ended.'}
                </p>
            ) : timeLeft ? (
                <div className="flex gap-4 sm:gap-8">
                    {[
                        { v: timeLeft.days, l: 'Days' },
                        { v: timeLeft.hours, l: 'Hours' },
                        { v: timeLeft.minutes, l: 'Min' },
                        { v: timeLeft.seconds, l: 'Sec' },
                    ].map(({ v, l }) => (
                        <div key={l} className="flex flex-col items-center">
                            <span
                                className={`min-w-[3.5rem] rounded-xl px-3 py-2 text-4xl font-extrabold tabular-nums sm:text-5xl ${
                                    isDark ? 'bg-white/10' : 'bg-muted'
                                }`}
                            >
                                {pad(v)}
                            </span>
                            {cfg.show_labels !== false && (
                                <span
                                    className={`mt-2 text-xs font-medium tracking-widest uppercase ${isDark ? 'opacity-70' : 'text-muted-foreground'}`}
                                >
                                    {l}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : null}

            {cfg.cta_label && cfg.cta_url && (
                <Link
                    href={cfg.cta_url}
                    className={`rounded-lg px-8 py-3 font-semibold transition-opacity hover:opacity-90 ${
                        isDark
                            ? 'bg-white text-gray-950'
                            : 'bg-primary text-primary-foreground'
                    }`}
                >
                    {cfg.cta_label}
                </Link>
            )}
        </div>
    );
}
