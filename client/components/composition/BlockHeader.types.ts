import type { ReactNode } from 'react';

export type BlockHeaderAlign = 'left' | 'center' | 'right';

export type BlockHeaderSize = 'default' | 'base' | 'lg' | 'display';

export interface BlockHeaderProps {
    title?: string;
    description?: string;
    eyebrow?: string;
    align?: BlockHeaderAlign;
    size?: BlockHeaderSize;
    /** Tighter gap between title and description (`mt-1` vs `mt-2`). */
    compactDescription?: boolean;
    /** Action or link aligned to the right of the title block (e.g. "View all"). */
    trailing?: ReactNode;
    /** Optional row below the description (e.g. CTA buttons). */
    actions?: ReactNode;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
}
