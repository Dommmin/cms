import { cn } from '@/lib/utils';

import type { PageHeaderProps } from './PageHeader.types';

export function PageHeader({
    title,
    description,
    eyebrow,
    align = 'left',
    className,
}: PageHeaderProps) {
    const centered = align === 'center';

    return (
        <header
            className={cn(
                'mb-[var(--block-gap,2rem)] space-y-3',
                centered &&
                    'mx-auto max-w-[var(--container-content-width,48rem)] text-center',
                className,
            )}
        >
            {eyebrow ? (
                <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                    {eyebrow}
                </p>
            ) : null}
            <h1
                className="font-[family-name:var(--font-heading)] text-[length:var(--h1-size,2.5rem)] leading-tight font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
            >
                {title}
            </h1>
            {description ? (
                <p className="text-muted-foreground text-lg leading-relaxed">
                    {description}
                </p>
            ) : null}
        </header>
    );
}
