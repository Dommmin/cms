'use client';

import { useEffect, useState } from 'react';

interface FlashSaleCountdownProps {
    endsAt: string | null;
    name?: string;
    salePrice: number;
    originalPrice?: number;
    stockRemaining?: number | null;
}

function formatTime(seconds: number): string {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
}

export function FlashSaleCountdown({
    endsAt,
    name,
    salePrice,
    originalPrice,
    stockRemaining,
}: FlashSaleCountdownProps) {
    const [secondsLeft, setSecondsLeft] = useState<number>(() => {
        if (!endsAt) return 0;
        const diff = Math.floor(
            (new Date(endsAt).getTime() - Date.now()) / 1000,
        );
        return Math.max(0, diff);
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);

    useEffect(() => {
        if (!endsAt) return;

        const tick = () => {
            const diff = Math.floor(
                (new Date(endsAt).getTime() - Date.now()) / 1000,
            );
            setSecondsLeft(Math.max(0, diff));
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    const isEnded = secondsLeft <= 0;

    return (
        <div
            className="overflow-hidden rounded-lg"
            role="region"
            aria-label="Flash sale timer"
        >
            {/* Header banner */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2">
                <span aria-hidden="true" className="text-lg">
                    🔥
                </span>
                <span className="text-sm font-bold tracking-wider text-white uppercase">
                    {name ?? 'Flash Sale'}
                </span>
            </div>

            {/* Body */}
            <div className="flex flex-wrap items-center gap-4 border border-orange-200 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 dark:border-orange-800 dark:from-red-950 dark:to-orange-950">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatPrice(salePrice)} PLN
                    </span>
                    {originalPrice != null && originalPrice > salePrice && (
                        <span className="text-muted-foreground text-sm line-through">
                            {formatPrice(originalPrice)} PLN
                        </span>
                    )}
                </div>

                {/* Countdown */}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        {isEnded ? 'Sale ended' : 'Ends in:'}
                    </span>
                    {mounted ? (
                        <span
                            className={`font-mono text-lg font-bold tabular-nums ${
                                isEnded
                                    ? 'text-muted-foreground'
                                    : 'text-red-600 dark:text-red-400'
                            }`}
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label={
                                isEnded
                                    ? 'Flash sale has ended'
                                    : `Time remaining: ${formatTime(secondsLeft)}`
                            }
                        >
                            {isEnded ? 'ENDED' : formatTime(secondsLeft)}
                        </span>
                    ) : (
                        <span className="font-mono text-lg font-bold text-red-600">
                            {formatTime(secondsLeft)}
                        </span>
                    )}
                </div>

                {/* Stock */}
                {stockRemaining != null && !isEnded && (
                    <p className="w-full text-xs font-medium text-orange-700 dark:text-orange-300">
                        Only {stockRemaining} left at this price!
                    </p>
                )}
            </div>
        </div>
    );
}
