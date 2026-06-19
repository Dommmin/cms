import { cn } from '@/lib/utils';

import type { SurfaceProps } from './Surface.types';
import { surfaceVariantClasses } from './styles';

export function Surface({
    children,
    variant = 'default',
    className,
    ...props
}: SurfaceProps) {
    return (
        <div
            className={cn(
                'rounded-lg',
                surfaceVariantClasses[variant],
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
