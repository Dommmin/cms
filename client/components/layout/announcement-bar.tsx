'use client';

import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiGetMany } from '@/lib/api';
import type { BannerPromotion, CountdownProps } from './announcement-bar.types';

function useCountdown(endsAt: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!endsAt) return;

    function calc() {
      const diff = Math.max(0, new Date(endsAt!).getTime() - Date.now());
      if (diff === 0) return setTimeLeft(null);
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    }

    calc();
    const id = setInterval(calc, 1_000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}

function Countdown({ endsAt }: CountdownProps) {
  const t = useCountdown(endsAt);
  if (!t) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="ml-2 font-mono font-bold tracking-wider">
      {t.h > 0 && `${pad(t.h)}:`}
      {pad(t.m)}:{pad(t.s)}
    </span>
  );
}

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState<number | null>(null);
  const [index, setIndex] = useState(0);

  const { data } = useQuery({
    queryKey: ['promotions', 'banners'],
    queryFn: () => apiGetMany<BannerPromotion>('/promotions'),
    staleTime: 5 * 60 * 1_000,
  });

  const promos = (data ?? []).filter((p) => p.id !== dismissed);

  // Rotate through promos every 5s if multiple
  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % promos.length), 5_000);
    return () => clearInterval(id);
  }, [promos.length]);

  if (!promos.length) return null;

  const promo = promos[index % promos.length];
  const bg = promo.banner_color ?? '#111827';

  const inner = (
    <div className="flex items-center justify-center gap-2 text-sm font-medium">
      <span>{promo.banner_text}</span>
      {promo.ends_at && <Countdown endsAt={promo.ends_at} />}
    </div>
  );

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2 text-white"
      style={{ backgroundColor: bg }}
    >
      {promo.banner_url ? (
        <Link href={promo.banner_url} className="hover:underline">
          {inner}
        </Link>
      ) : (
        inner
      )}

      <button
        onClick={() => setDismissed(promo.id)}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
