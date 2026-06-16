export type CTASectionStyle = 'plain' | 'gradient' | 'dark' | 'brand' | 'image';

export type CTASectionAlign = 'left' | 'center' | 'right';

export interface CTASectionProps {
    title?: string;
    description?: string;
    primaryLabel?: string;
    primaryHref?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
    style?: CTASectionStyle;
    align?: CTASectionAlign;
    badge?: string;
    backgroundImageUrl?: string;
    className?: string;
}
