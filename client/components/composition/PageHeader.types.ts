import type { ReactNode } from 'react';

export interface PageHeaderProps {
    title: string;
    description?: string;
    eyebrow?: string;
    align?: 'left' | 'center' | 'right';
    /** Optional actions row (e.g. CTA buttons) rendered below the description. */
    actions?: ReactNode;
    className?: string;
}
