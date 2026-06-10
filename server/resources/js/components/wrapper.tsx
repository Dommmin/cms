import { cn } from '@/lib/utils';
import type { WrapperProps } from './wrapper.types';

export default function Wrapper({ children, className }: WrapperProps) {
    return (
        <div className={cn('space-y-5 p-4 sm:space-y-6 sm:p-6', className)}>
            {children}
        </div>
    );
}
