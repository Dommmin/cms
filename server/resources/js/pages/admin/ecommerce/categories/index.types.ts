import type {
    CategoryRow,
} from '@/components/columns/category-columns.types';

export type CategoryData = {
    data: CategoryRow[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
