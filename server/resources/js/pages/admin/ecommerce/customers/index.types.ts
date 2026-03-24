export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    orders_count: number;
    orders_sum_total: number;
}
export interface PaginationData {
    data: Customer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    customers: PaginationData;
    filters: {
        search?: string;
    };
}
