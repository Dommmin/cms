import type { PageBlock } from '@/types/api';

export interface StatItem {
    value: string;
    suffix?: string;
    label?: string;
    icon?: string;
}
export interface StatsCounterConfig {
    title?: string;
    subtitle?: string;
    style?: 'plain' | 'card' | 'bordered' | 'icon';
    columns?: number;
    animate_numbers?: boolean;
    stats?: StatItem[];
}
export interface StatsCounterProps {
    block: PageBlock;
}
