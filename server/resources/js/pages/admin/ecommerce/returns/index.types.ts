export type Customer = {
    first_name: string;
    last_name: string;
    email: string;
} | null;
export type Order = {
    id: number;
    order_number: string;
    customer: Customer;
};
export type ReturnRequest = {
    id: number;
    reference_number: string;
    status: string;
    return_type: string;
    order: Order;
    created_at: string;
};
export type ReturnsData = {
    data: ReturnRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    returns: ReturnsData;
    filters: { search?: string; status?: string };
};
