export interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: string;
    is_filterable: boolean;
    is_variant_selection: boolean;
    values_count: number;
}
export interface PaginationData {
    data: Attribute[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    attributes: PaginationData;
    filters: {
        search?: string;
        type?: string;
    };
}
