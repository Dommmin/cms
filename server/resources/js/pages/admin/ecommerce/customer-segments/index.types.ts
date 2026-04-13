export interface CustomerSegment {
    id: number;
    name: string;
    description: string | null;
    type: 'manual' | 'dynamic';
    rules: Record<string, unknown>[] | null;
    customers_count: number;
    is_active: boolean;
    created_at: string;
}

export interface PaginationData {
    data: CustomerSegment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface IndexProps {
    segments: PaginationData;
}
