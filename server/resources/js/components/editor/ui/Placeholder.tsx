import { type JSX } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    children: React.ReactNode;
    className?: string;
}

export default function Placeholder({ children, className }: Props): JSX.Element {
    return (
        <div className={cn('Placeholder__root pointer-events-none absolute left-4 top-4 select-none text-muted-foreground', className)}>
            {children}
        </div>
    );
}
