import type { ReactNode } from 'react';

export interface ContainerProps {
    children: ReactNode;
    className?: string;
    /** Semantic element to render. Defaults to `div`. */
    as?: 'div' | 'section' | 'article' | 'main' | 'aside';
    /** Narrow reading width (`--container-narrow-width`). */
    narrow?: boolean;
    /** Wide storefront shell width (`--store-wide-shell-width`). */
    wide?: boolean;
    /** Edge-to-edge: no max-width constraint. */
    fullWidth?: boolean;
}
