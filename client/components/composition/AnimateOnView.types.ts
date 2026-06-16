import type { ReactNode } from 'react';

export interface AnimateOnViewProps {
    children: ReactNode;
    className?: string;
    animation?: 'fade-in' | 'fade-up' | 'fade-left' | 'fade-right' | 'zoom-in';
}
