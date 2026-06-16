import type { ReactNode } from 'react';

import type { GridCols } from './styles';

export interface GridProps {
    children: ReactNode;
    cols: GridCols;
    /** Vertical alignment of grid items. */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /**
     * Tailwind gap class override. Defaults to the `--block-gap` design token so
     * grids stay consistent with the active theme.
     */
    gap?: string;
    className?: string;
}
