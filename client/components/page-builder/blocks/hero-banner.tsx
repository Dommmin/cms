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
                        alt={
                            (bgRelation?.metadata?.alt as string) ??
                            cfg.title ??
                            ''
                        }
                        fill
                        className="object-cover"
                        priority
                    />
                    <div
                        className="absolute inset-0 bg-[var(--section-dark-bg,var(--foreground))]"
                        style={{ opacity: overlayOpacity }}
                    />
                </>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-[var(--primary)]/70" />
            )}

            {/* Content */}
            <div
                className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 ${alignClass}`}
            >
                {cfg.title && (
                    <h1 className="text-4xl font-bold text-[var(--primary-foreground)] drop-shadow-md md:text-6xl">
                        {cfg.title}
                    </h1>
                )}
                {cfg.subtitle && (
                    <p className="max-w-2xl text-lg text-[var(--primary-foreground)]/90 drop-shadow md:text-xl">
                        {cfg.subtitle}
                    </p>
                )}
                {(cfg.cta_text || cfg.cta2_text) && (
                    <div className="mt-2 flex flex-wrap gap-4">
                        {cfg.cta_text && cfg.cta_url && (
                            <Link
                                href={cfg.cta_url}
                                className="font-semibold transition-colors hover:opacity-90"
                                style={{
                                    backgroundColor: 'var(--primary)',
                                    color: 'var(--primary-foreground)',
                                    borderRadius: 'var(--btn-radius, 0.5rem)',
                                    paddingInline: 'var(--btn-padding-x, 2rem)',
                                    paddingBlock:
                                        'var(--btn-padding-y, 0.75rem)',
                                }}
                            >
                                {cfg.cta_text}
                            </Link>
                        )}
                        {cfg.cta2_text && cfg.cta2_url && (
                            <Link
                                href={cfg.cta2_url}
                                className="font-semibold transition-colors"
                                style={{
                                    borderColor: 'var(--primary-foreground)',
                                    color: 'var(--primary-foreground)',
                                    borderRadius:
                                        'var(--btn-secondary-radius, 0.5rem)',
                                    paddingInline:
                                        'var(--btn-secondary-padding-x, 2rem)',
                                    paddingBlock:
                                        'var(--btn-secondary-padding-y, 0.75rem)',
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                }}
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
