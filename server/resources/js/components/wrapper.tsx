import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { WrapperProps } from './wrapper.types';

export default function Wrapper({ children, className }: WrapperProps) {
    return <div className={cn('space-y-6 p-6', className)}>{children}</div>;
}
