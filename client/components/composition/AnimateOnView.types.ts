import type { ReactNode } from 'react';

export type AnimationPreset = {
    initial: Record<string, number>;
    animate: Record<string, number>;
};

export interface AnimateOnViewProps {
    /** Preset key (e.g. `fade-up`). Unknown keys render a plain section. */
    animation: string;
    className?: string;
    'data-section-type'?: string;
    'data-section-id'?: number;
    children: ReactNode;
}
