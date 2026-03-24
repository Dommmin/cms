export interface Discount {
    id: number;
    code: string;
    name: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    is_active: boolean;
    uses_count: number;
    max_uses?: number;
}
export interface PaginationData {
    data: Discount[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    discounts: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}
