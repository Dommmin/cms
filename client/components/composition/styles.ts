import type { SectionLayout, SectionVariant } from '@/types/api';

export type { SectionLayout, SectionVariant } from '@/types/api';

/** Non-null section variant keys (the `null` case falls back to `light`). */
export type SectionVariantKey = Exclude<SectionVariant, null>;

export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type GridCols = 2 | 3 | 4;

/**
 * Single source of truth for section background variants.
 * Extracted 1:1 from the page-builder section renderer so the renderer and the
 * `<Section>` primitive stay in lock-step (no duplicated class maps).
 */
export const sectionVariantClasses: Record<SectionVariantKey, string> = {
    light: 'bg-[var(--background)] text-[var(--foreground)]',
    dark: 'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
    muted: 'bg-[var(--muted)] text-[var(--foreground)]',
    brand: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    hero: 'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
};

export const sectionPaddingClasses: Record<SectionPadding, string> = {
    none: 'py-0',
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-[var(--section-padding-y,5rem)]',
    xl: 'py-28',
};

/**
 * Section layout containers, consumed by the page-builder section renderer.
 * Keyed by the canonical `SectionLayout` union from the API types.
 */
export const containerClasses: Record<SectionLayout, string> = {
    contained:
        'mx-auto max-w-[var(--container-max-width,80rem)] px-4 sm:px-6 lg:px-8',
    'full-width': 'w-full',
    flush: 'w-full',
    'two-col':
        'mx-auto max-w-[var(--container-max-width,80rem)] px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8',
    'three-col':
        'mx-auto max-w-[var(--container-max-width,80rem)] px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8',
};

/**
 * Column templates for the `<Grid>` primitive. Gap is applied by the component
 * (defaults to the `--block-gap` token) so consumers can override it.
 */
export const gridClasses: Record<GridCols, string> = {
    2: 'grid grid-cols-1 md:grid-cols-2',
    3: 'grid grid-cols-1 md:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};
