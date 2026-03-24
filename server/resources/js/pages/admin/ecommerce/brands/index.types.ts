export interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    products_count: number;
}
export interface PaginationData {
    data: Brand[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    brands: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}
