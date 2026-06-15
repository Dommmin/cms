import type { PageBlock } from '@/types/api';

export interface FeaturedProductsConfig {
    filter_mode?: 'manual' | 'featured';
    title?: string;
    subtitle?: string;
    items_per_row?: 1 | 2 | 3 | 4 | 5 | 6;
    max_items?: number;
    view_all_url?: string;
    view_all_label?: string;
}
export interface FeaturedProductsProps {
    block: PageBlock;
}
