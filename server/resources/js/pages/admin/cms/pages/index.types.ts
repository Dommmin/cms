import type { PageRow } from '@/components/columns/page-columns.types';

export type PagesData = {
    data: PageRow[];
    prev_page_url?: string | null;
    next_page_url?: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
