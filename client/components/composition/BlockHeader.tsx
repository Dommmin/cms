import { cn } from '@/lib/utils';

import type { BlockHeaderProps } from './BlockHeader.types';

const titleSizeClasses = {
    default:
        'text-[length:var(--h2-size,2rem)] font-bold leading-tight md:text-[length:var(--h1-size,2.5rem)]',
    base: 'text-[length:var(--h2-size,2rem)] font-bold leading-tight',
    lg: 'text-[length:var(--h1-size,2.5rem)] font-bold leading-tight tracking-tight',
    display:
        'text-[length:var(--h1-size,2.5rem)] font-bold leading-tight md:text-[length:calc(var(--h1-size,2.5rem)*1.15)]',
} as const;

export function BlockHeader({
    title,
    description,
    eyebrow,
    align = 'left',
    size = 'default',
    compactDescription = false,
    trailing,
    actions,
    className,
    titleClassName,
    descriptionClassName,
}: BlockHeaderProps) {
    if (!title && !description && !eyebrow) {
        return null;
    }

    const centered = align === 'center';
    const alignedRight = align === 'right';

    const headerContent = (
        <header
            className={cn(
                'space-y-2',
                centered && 'text-center',
                alignedRight && 'text-right',
                !trailing &&
                    centered &&
                    'mx-auto max-w-[var(--container-content-width,48rem)]',
            )}
        >
            {eyebrow ? (
                <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                    {eyebrow}
                </p>
            ) : null}
            {title ? (
                <h2
                    className={cn(
                        titleSizeClasses[size],
                        'font-[family-name:var(--font-heading)] leading-tight',
                        titleClassName,
                    )}
                    style={{ fontFamily: 'var(--font-heading)' }}
                >
                    {title}
                </h2>
            ) : null}
            {description ? (
                <p
                    className={cn(
                        'text-muted-foreground',
                        compactDescription ? 'mt-1' : 'mt-2',
                        descriptionClassName,
                    )}
                >
                    {description}
                </p>
            ) : null}
            {actions ? (
                <div
                    className={cn(
                        'flex flex-wrap gap-3 pt-2',
                        centered && 'justify-center',
                        alignedRight && 'justify-end',
                    )}
                >
                    {actions}
                </div>
            ) : null}
        </header>
    );

    if (trailing) {
        return (
            <div
                className={cn(
                    'flex items-end justify-between gap-4',
                    className,
                )}
            >
                {headerContent}
                <div className="shrink-0">{trailing}</div>
            </div>
        );
    }

    return <div className={className}>{headerContent}</div>;
}
