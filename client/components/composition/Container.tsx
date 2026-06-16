import { cn } from '@/lib/utils';

import type { ContainerProps } from './Container.types';

export function Container({
    children,
    className,
    narrow,
    wide,
}: ContainerProps) {
    const maxWidth = wide
        ? 'var(--store-wide-shell-width, 96rem)'
        : narrow
          ? 'var(--container-narrow-width, 40rem)'
          : 'var(--container-max-width, 80rem)';

    return (
        <div
            className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', className)}
            style={{ maxWidth }}
        >
            {children}
        </div>
    );
}
