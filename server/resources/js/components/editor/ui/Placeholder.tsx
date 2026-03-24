import { type JSX } from 'react';
import { cn } from '@/lib/utils';
import type { PlaceholderProps } from './Placeholder.types';

export default function Placeholder({
    children,
    className,
}: PlaceholderProps): JSX.Element {
    return (
        <div
            className={cn(
                'Placeholder__root pointer-events-none absolute top-4 left-4 text-muted-foreground select-none',
                className,
            )}
        >
            {children}
        </div>
    );
}
