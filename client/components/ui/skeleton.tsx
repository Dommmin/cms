import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'shimmer' | 'pulse';
}

export function Skeleton({
    className,
    variant = 'shimmer',
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'bg-muted/60 rounded-lg',
                variant === 'shimmer'
                    ? 'skeleton-shimmer'
                    : 'bg-muted-foreground/10 animate-pulse',
                className,
            )}
            {...props}
        />
    );
}
