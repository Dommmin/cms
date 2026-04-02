import type { PageBlock } from '@/types/api';

export interface CallToActionConfig {
    title?: string;
    subtitle?: string;
    alignment?: 'left' | 'center' | 'right';
    style?: 'plain' | 'gradient' | 'dark' | 'brand' | 'image';
    primary_label?: string;
    primary_url?: string;
    secondary_label?: string;
    secondary_url?: string;
    badge_text?: string;
}
export interface CallToActionProps {
    block: PageBlock;
}
