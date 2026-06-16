import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { CTASectionProps } from './CTASection.types';

const styleClasses: Record<NonNullable<CTASectionProps['style']>, string> = {
    plain: 'bg-[var(--background)] text-[var(--foreground)]',
    gradient:
        'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-[var(--primary-foreground)]',
    dark: 'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
    brand: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    image: 'relative bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))] overflow-hidden',
};

const alignClasses: Record<NonNullable<CTASectionProps['align']>, string> = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
};

export function CTASection({
    title,
    description,
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
    style = 'brand',
    align = 'center',
    badge,
    backgroundImageUrl,
    className,
}: CTASectionProps) {
    const isLight = style === 'plain';
    const hasPrimary = Boolean(primaryLabel && primaryHref);
    const hasSecondary = Boolean(secondaryLabel && secondaryHref);

    return (
        <div className={cn('relative w-full', className)}>
            {style === 'image' && backgroundImageUrl ? (
                <Image
                    src={backgroundImageUrl}
                    alt=""
                    fill
                    className="absolute inset-0 z-0 rounded-2xl object-cover opacity-30"
                />
            ) : null}
            <div
                className={cn(
                    'relative z-10 flex flex-col rounded-2xl px-8 py-16',
                    styleClasses[style],
                    alignClasses[align],
                )}
                style={{ gap: 'var(--block-gap, 1.5rem)' }}
            >
                {badge ? (
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                        {badge}
                    </span>
                ) : null}
                {title ? (
                    <h2
                        className={cn(
                            'max-w-3xl text-3xl font-bold md:text-4xl',
                            isLight
                                ? 'text-[var(--foreground)]'
                                : 'text-[var(--section-dark-text,var(--background))]',
                        )}
                    >
                        {title}
                    </h2>
                ) : null}
                {description ? (
                    <p
                        className={cn(
                            'max-w-2xl text-lg',
                            isLight
                                ? 'text-[var(--muted-foreground)]'
                                : 'text-[var(--section-dark-text,var(--background))]/80',
                        )}
                    >
                        {description}
                    </p>
                ) : null}
                {hasPrimary || hasSecondary ? (
                    <div
                        className={cn(
                            'flex flex-wrap',
                            align === 'center' && 'justify-center',
                            align === 'right' && 'justify-end',
                        )}
                        style={{ gap: 'var(--block-gap, 1rem)' }}
                    >
                        {hasPrimary ? (
                            <Link
                                href={primaryHref!}
                                className={cn(
                                    'font-semibold transition-opacity hover:opacity-90',
                                    isLight
                                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                        : 'bg-[var(--section-dark-text,var(--background))] text-[var(--section-dark-bg,var(--foreground))]',
                                )}
                                style={{
                                    borderRadius: 'var(--btn-radius, 0.5rem)',
                                    paddingInline: 'var(--btn-padding-x, 2rem)',
                                    paddingBlock:
                                        'var(--btn-padding-y, 0.75rem)',
                                }}
                            >
                                {primaryLabel}
                            </Link>
                        ) : null}
                        {hasSecondary ? (
                            <Link
                                href={secondaryHref!}
                                className={cn(
                                    'font-semibold transition-colors',
                                    isLight
                                        ? 'border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5'
                                        : 'border-[var(--section-dark-text,var(--background))] text-[var(--section-dark-text,var(--background))] hover:bg-[var(--section-dark-text,var(--background))]/10',
                                )}
                                style={{
                                    borderWidth: '2px',
                                    borderRadius:
                                        'var(--btn-secondary-radius, 0.5rem)',
                                    paddingInline:
                                        'var(--btn-secondary-padding-x, 2rem)',
                                    paddingBlock:
                                        'var(--btn-secondary-padding-y, 0.75rem)',
                                }}
                            >
                                {secondaryLabel}
                            </Link>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
