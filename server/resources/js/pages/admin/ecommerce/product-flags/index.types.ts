export interface ProductFlag {
    id: number;
    name: string;
    slug: string;
    color: string;
    description: string | null;
    is_active: boolean;
    position: number;
}
export interface PaginationData {
    data: ProductFlag[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    flags: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}
