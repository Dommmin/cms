import Image from 'next/image';
import Link from 'next/link';

import { getRelationByKey } from '@/lib/format';
import type { HeroBannerConfig, HeroBannerProps } from './hero-banner.types';

export function HeroBannerBlock({ block }: HeroBannerProps) {
  const cfg = block.configuration as HeroBannerConfig;
  const align = cfg.text_alignment ?? 'center';
  const minHeight = cfg.min_height ?? 500;
  const overlayOpacity = (cfg.overlay_opacity ?? 40) / 100;

  const bgRelation = getRelationByKey(block.relations, 'background');
  const bgUrl = bgRelation?.metadata?.url as string | undefined;

  const alignClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[align];

  const ctaClass = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold transition-colors',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-lg font-semibold transition-colors',
    outline:
      'border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-8 py-3 rounded-lg font-semibold transition-colors',
    ghost:
      'text-primary-foreground hover:bg-primary-foreground/10 px-8 py-3 rounded-lg font-semibold transition-colors',
  }[cfg.cta_style ?? 'primary'];

  return (
    <div
      className="relative flex w-full flex-col justify-center overflow-hidden"
      style={{ minHeight }}
    >
      {/* Background */}
      {bgUrl ? (
        <>
          <Image
            src={bgUrl}
            alt={(bgRelation?.metadata?.alt as string) ?? cfg.title ?? ''}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
        </>
      ) : (
        <div className="from-primary via-primary/90 to-primary/70 absolute inset-0 bg-gradient-to-br" />
      )}

      {/* Content */}
      <div
        className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 ${alignClass}`}
      >
        {cfg.title && (
          <h1 className="text-primary-foreground text-4xl font-bold drop-shadow-md md:text-6xl">
            {cfg.title}
          </h1>
        )}
        {cfg.subtitle && (
          <p className="text-primary-foreground/90 max-w-2xl text-lg drop-shadow md:text-xl">
            {cfg.subtitle}
          </p>
        )}
        {(cfg.cta_text || cfg.cta2_text) && (
          <div className="mt-2 flex flex-wrap gap-4">
            {cfg.cta_text && cfg.cta_url && (
              <Link href={cfg.cta_url} className={ctaClass}>
                {cfg.cta_text}
              </Link>
            )}
            {cfg.cta2_text && cfg.cta2_url && (
              <Link
                href={cfg.cta2_url}
                className={
                  {
                    primary:
                      'bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-3 font-semibold transition-colors',
                    secondary:
                      'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-8 py-3 font-semibold transition-colors',
                    outline:
                      'border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 rounded-lg border-2 px-8 py-3 font-semibold transition-colors',
                    ghost:
                      'text-primary-foreground hover:bg-primary-foreground/10 rounded-lg px-8 py-3 font-semibold transition-colors',
                  }[cfg.cta2_style ?? 'outline']
                }
              >
                {cfg.cta2_text}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
