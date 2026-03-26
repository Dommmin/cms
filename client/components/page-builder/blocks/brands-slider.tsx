'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { getRelationsByKey } from '@/lib/format';
import type { Brand } from '@/types/api';
import type { BrandsSliderConfig, BrandsSliderProps } from './brands-slider.types';

const pxPerSecond: Record<string, number> = {
  slow: 50,
  normal: 90,
  fast: 160,
};

export function BrandsSliderBlock({ block }: BrandsSliderProps) {
  const cfg = block.configuration as BrandsSliderConfig;
  const logoHeight = cfg.logo_height ?? 48;
  const grayscale = cfg.grayscale !== false;
  const speed = cfg.speed ?? 'normal';

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const brandRelations = getRelationsByKey(block.relations, 'brands');
  const brands = brandRelations
    .map((r) => r.data as Brand | null)
    .filter((b): b is Brand => b !== null);

  // Duplicate for seamless loop
  const items = [...brands, ...brands];

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container || brands.length === 0) return;

    const containerWidth = container.offsetWidth;
    const trackWidth = track.scrollWidth;
    const oneSetWidth = trackWidth / 2; // half = one set of brands
    const velocity = pxPerSecond[speed] ?? 90;

    // Phase 1: slide in from the right (off-screen → position 0)
    const enterMs = (containerWidth / velocity) * 1000;
    // Phase 2: seamless loop (0 → -oneSetWidth)
    const loopMs = (oneSetWidth / velocity) * 1000;

    const enterAnim = track.animate(
      [{ transform: `translateX(${containerWidth}px)` }, { transform: 'translateX(0px)' }],
      { duration: enterMs, easing: 'linear', fill: 'forwards' },
    );

    enterAnim.onfinish = () => {
      track.animate(
        [{ transform: 'translateX(0px)' }, { transform: `translateX(-${oneSetWidth}px)` }],
        { duration: loopMs, easing: 'linear', iterations: Infinity },
      );
    };

    return () => {
      track.getAnimations().forEach((a) => a.cancel());
    };
  }, [speed, brands.length]);

  if (brands.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {cfg.title && (
        <p className="text-muted-foreground text-center text-sm font-semibold tracking-widest uppercase">
          {cfg.title}
        </p>
      )}

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <div ref={trackRef} className="flex w-max gap-12">
          {items.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className={`flex min-w-[160px] shrink-0 items-center justify-center transition-all duration-300 ${
                grayscale ? 'grayscale hover:grayscale-0' : ''
              } opacity-70 hover:opacity-100`}
            >
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  width={160}
                  height={logoHeight}
                  className="object-contain"
                  style={{ height: logoHeight, width: 'auto' }}
                />
              ) : (
                <span className="text-muted-foreground text-sm font-semibold">{brand.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
