import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { CTASectionProps } from './CTASection.types';
import { Section } from './Section';

export function CTASection({
    title,
    description,
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
    className,
}: CTASectionProps) {
    return (
        <Section variant="brand" className={className}>
            <div className="mx-auto max-w-[var(--container-content-width,48rem)] text-center">
                <h2
                    className="text-[length:var(--h2-size,2rem)] font-bold tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)' }}
                >
                    {title}
                </h2>
                {description ? (
                    <p className="mt-3 text-lg opacity-90">{description}</p>
                ) : null}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href={primaryHref}
                        className={cn(
                            'bg-primary-foreground text-primary inline-flex items-center justify-center font-semibold transition-opacity hover:opacity-90',
                            'rounded-[var(--btn-radius,0.375rem)] px-[var(--btn-padding-x,1.5rem)] py-[var(--btn-padding-y,0.625rem)]',
                        )}
                    >
                        {primaryLabel}
                    </Link>
                    {secondaryLabel && secondaryHref ? (
                        <Link
                            href={secondaryHref}
                            className={cn(
                                'border-primary-foreground/40 inline-flex items-center justify-center border font-semibold transition-opacity hover:opacity-90',
                                'rounded-[var(--btn-secondary-radius,0.375rem)] px-[var(--btn-secondary-padding-x,1.5rem)] py-[var(--btn-secondary-padding-y,0.625rem)]',
                            )}
                        >
                            {secondaryLabel}
                        </Link>
                    ) : null}
                </div>
            </div>
        </Section>
    );
}
