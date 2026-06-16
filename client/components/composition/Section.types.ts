import type { ReactNode } from 'react';

export interface SectionProps {
    children: ReactNode;
    className?: string;
    variant?: 'light' | 'dark' | 'muted' | 'brand';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    id?: string;
}
