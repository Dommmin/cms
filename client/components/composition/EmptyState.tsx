import { cn } from '@/lib/utils';

import type { EmptyStateProps } from './EmptyState.types';

export function EmptyState({
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'border-border bg-card text-card-foreground flex flex-col items-center justify-center rounded-[var(--store-card-radius,var(--radius))] border px-6 py-12 text-center shadow-[var(--store-shadow-soft)]',
                className,
            )}
        >
            <h3
                className="text-[length:var(--h3-size,1.5rem)] font-semibold"
                style={{ fontFamily: 'var(--font-heading)' }}
            >
                {title}
            </h3>
            {description ? (
                <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-6">{action}</div> : null}
        </div>
    );
}
