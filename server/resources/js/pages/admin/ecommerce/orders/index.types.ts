import type { OrderRow } from '@/components/columns/order-columns.types';

export type OrderData = {
    data: OrderRow[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
