import type {
    ReviewRow,
} from '@/components/columns/review-columns.types';

export type IndexProps = {
    reviews: {
        data: ReviewRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters?: { search?: string };
};
