import type { PageBlock } from '@/types/api';

export interface FeaturedProductsConfig {
    filter_mode?: 'manual' | 'featured';
    title?: string;
    subtitle?: string;
    columns?: 2 | 3 | 4;
    max_items?: number;
    view_all_url?: string;
    view_all_label?: string;
}
export interface FeaturedProductsProps {
    block: PageBlock;
}
