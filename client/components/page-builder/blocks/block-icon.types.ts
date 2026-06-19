export type BlockIconSize = 'sm' | 'md' | 'lg' | 'xl';

export interface BlockIconProps {
    name?: string;
    /** Optional merchant override — applied via `--block-icon-color` CSS variable. */
    color?: string;
    size?: BlockIconSize;
    className?: string;
}
