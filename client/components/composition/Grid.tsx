import { cn } from '@/lib/utils';

import type { GridProps } from './Grid.types';
import { gridClasses } from './styles';

const alignClasses: Record<NonNullable<GridProps['align']>, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
};

export function Grid({ children, cols, align, gap, className }: GridProps) {
    return (
        <div
            className={cn(
                gridClasses[cols],
                gap ?? 'gap-[var(--block-gap,2rem)]',
                align && alignClasses[align],
                className,
            )}
        >
            {children}
        </div>
    );
}
