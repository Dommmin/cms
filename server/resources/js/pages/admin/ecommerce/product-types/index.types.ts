export interface ProductType {
    id: number;
    name: string;
    slug: string;
    has_variants: boolean;
    is_shippable: boolean;
    products_count: number;
}
export interface PaginationData {
    data: ProductType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    types: PaginationData;
    filters: {
        search?: string;
        has_variants?: boolean;
    };
}
