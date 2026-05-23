import Image from 'next/image';
import Link from 'next/link';

import { getRelationsByKey } from '@/lib/format';
import type {
    CallToActionConfig,
    CallToActionProps,
} from './call-to-action.types';

export function CallToActionBlock({ block }: CallToActionProps) {
    const cfg = block.configuration as CallToActionConfig;
    const alignment = cfg.alignment ?? 'center';
    const style = cfg.style ?? 'gradient';

    const bgMedia = getRelationsByKey(block.relations, 'background')[0];
    const bgImageUrl = bgMedia?.metadata?.url as string | undefined;

    const alignClass = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right',
    }[alignment];

    const containerStyle = {
        plain: 'bg-[var(--background)] text-[var(--foreground)]',
        gradient:
            'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-[var(--primary-foreground)]',
        dark: 'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
        brand: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
        image: 'relative bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))] overflow-hidden',
    }[style];

    const isLight = style === 'plain';

    return (
        <div
            className={`relative rounded-2xl px-8 py-16`}
            style={{ gap: 'var(--block-gap, 1.5rem)' }}
        >
            {style === 'image' && bgImageUrl && (
                <Image
                    src={bgImageUrl}
                    alt=""
                    fill
                    className="object-cover opacity-30"
                />
            )}
            <div
                className={`relative flex flex-col ${containerStyle} rounded-2xl px-8 py-16 ${alignClass}`}
            >
                {cfg.badge_text && (
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                        {cfg.badge_text}
                    </span>
                )}
                {cfg.title && (
                    <h2
                        className={`max-w-3xl text-3xl font-bold md:text-4xl ${isLight ? 'text-[var(--foreground)]' : 'text-[var(--section-dark-text,var(--background))]'}`}
                    >
                        {cfg.title}
                    </h2>
                )}
                {cfg.subtitle && (
                    <p
                        className={`max-w-2xl text-lg ${isLight ? 'text-[var(--muted-foreground)]' : 'text-[var(--section-dark-text,var(--background))]/80'}`}
                    >
                        {cfg.subtitle}
                    </p>
                )}
                {(cfg.primary_label || cfg.secondary_label) && (
                    <div
                        className={`flex flex-wrap ${alignment === 'center' ? 'justify-center' : ''}`}
                        style={{ gap: 'var(--block-gap, 1rem)' }}
                    >
                        {cfg.primary_label && cfg.primary_url && (
                            <Link
                                href={cfg.primary_url}
                                className={`font-semibold transition-opacity hover:opacity-90 ${
                                    isLight
                                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                        : 'bg-[var(--section-dark-text,var(--background))] text-[var(--section-dark-bg,var(--foreground))]'
                                }`}
                                style={{
                                    borderRadius: 'var(--btn-radius, 0.5rem)',
                                    paddingInline: 'var(--btn-padding-x, 2rem)',
                                    paddingBlock:
                                        'var(--btn-padding-y, 0.75rem)',
                                }}
                            >
                                {cfg.primary_label}
                            </Link>
                        )}
                        {cfg.secondary_label && cfg.secondary_url && (
                            <Link
                                href={cfg.secondary_url}
                                className={`font-semibold transition-colors ${
                                    isLight
                                        ? 'border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5'
                                        : 'border-[var(--section-dark-text,var(--background))] text-[var(--section-dark-text,var(--background))] hover:bg-[var(--section-dark-text,var(--background))]/10'
                                }`}
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
                                {cfg.secondary_label}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
