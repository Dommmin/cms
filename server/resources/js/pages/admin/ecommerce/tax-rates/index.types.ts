export interface TaxRate {
    id: number;
    name: string;
    rate: number;
    country_code?: string;
    is_active: boolean;
    is_default: boolean;
}
export interface PaginationData {
    data: TaxRate[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    taxRates: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}
