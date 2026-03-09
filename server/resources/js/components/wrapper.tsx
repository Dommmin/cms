import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WrapperProps {
    children: ReactNode;
    className?: string;
}

export default function Wrapper({ children, className }: WrapperProps) {
    return <div className={cn('space-y-6 p-6', className)}>{children}</div>;
}
