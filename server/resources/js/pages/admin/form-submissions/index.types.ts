export interface Submission {
    id: number;
    form_id: number;
    payload: Record<string, unknown>;
    status: string | null;
    ip: string | null;
    user_agent: string | null;
    page_url: string | null;
    created_at: string;
    form: {
        id: number;
        name: string;
    };
}
export interface PaginationData {
    data: Submission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}
export interface IndexProps {
    submissions: PaginationData;
    filters: {
        search?: string;
        form_id?: string;
        date_from?: string;
        date_to?: string;
    };
}
