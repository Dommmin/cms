import { cn } from '@/lib/utils';

import type { StackProps } from './Stack.types';
import { stackGapClasses } from './styles';

export function Stack({
    children,
    gap = 'md',
    className,
    ...props
}: StackProps) {
    return (
        <div
            className={cn('flex flex-col', stackGapClasses[gap], className)}
            {...props}
        >
            {children}
        </div>
    );
}
