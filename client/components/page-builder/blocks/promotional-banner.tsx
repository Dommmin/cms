import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { BlockHeader } from '@/components/composition';
import { getRelationByKey } from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
    PromotionalBannerConfig,
    PromotionalBannerProps,
} from './promotional-banner.types';

export function PromotionalBannerBlock({ block }: PromotionalBannerProps) {
    const cfg = block.configuration as PromotionalBannerConfig;
    const layout = cfg.layout ?? 'left';

    const bgRelation = getRelationByKey(block.relations, 'background');
    const bgUrl = bgRelation?.metadata?.url as string | undefined;

    const isCenter = layout === 'center';
    const isRight = layout === 'right';

    const bannerStyle = cfg.background_color
        ? ({ '--banner-bg': cfg.background_color } as CSSProperties)
        : undefined;

    return (
        <div
            className={cn(
                'relative flex min-h-64 overflow-hidden rounded-2xl',
                cfg.background_color && 'bg-[var(--banner-bg)]',
            )}
            style={bannerStyle}
        >
            {bgUrl && (
                <>
                    <Image
                        src={bgUrl}
                        alt={cfg.title ?? 'Promotion'}
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[var(--section-dark-bg,var(--foreground))]/40" />
                </>
            )}

            <div
                className={`relative z-10 flex flex-col justify-center gap-4 p-8 md:p-12 ${
                    isCenter ? 'mx-auto text-center' : isRight ? 'ml-auto' : ''
                } max-w-xl`}
            >
                {cfg.badge_text && (
                    <span className="bg-primary text-primary-foreground w-fit rounded-full px-4 py-1 text-sm font-semibold">
                        {cfg.badge_text}
                    </span>
                )}
                <BlockHeader
                    title={cfg.title}
                    description={cfg.subtitle}
                    size="display"
                    align={isCenter ? 'center' : isRight ? 'right' : 'left'}
                    titleClassName={
                        bgUrl
                            ? 'text-[var(--section-dark-text,var(--primary-foreground))]'
                            : undefined
                    }
                    descriptionClassName={cn(
                        'text-lg',
                        bgUrl
                            ? 'text-[var(--section-dark-text,var(--primary-foreground))]/90'
                            : undefined,
                    )}
                />
                {cfg.cta_text && cfg.cta_url && (
                    <div>
                        <Link
                            href={cfg.cta_url}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-lg px-8 py-3 font-semibold transition-colors"
                        >
                            {cfg.cta_text}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
