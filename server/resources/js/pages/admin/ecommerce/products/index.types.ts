import type { ProductRow } from '@/components/columns/product-columns.types';

export type ProductData = {
    data: ProductRow[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
