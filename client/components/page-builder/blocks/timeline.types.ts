import type { PageBlock } from '@/types/api';

export interface TimelineItem {
    date?: string;
    title?: string;
    description?: string;
    icon?: string;
}
export interface TimelineConfig {
    title?: string;
    subtitle?: string;
    layout?: 'left' | 'center' | 'right';
    items?: TimelineItem[];
}
export interface TimelineProps {
    block: PageBlock;
}
