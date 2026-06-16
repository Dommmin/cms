'use client';

import { AnimatedSection } from '@/components/page-builder/animated-section';

import type { AnimateOnViewProps } from './AnimateOnView.types';

export function AnimateOnView({
    children,
    className,
    animation = 'fade-up',
}: AnimateOnViewProps) {
    return (
        <AnimatedSection animation={animation} className={className}>
            {children}
        </AnimatedSection>
    );
}
