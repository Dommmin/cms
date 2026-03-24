export type Submission = {
    id: number;
    form_id: number;
    data: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
};
export type SubmissionsData = {
    data: Submission[];
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
export type FormData = {
    id: number;
    name: string;
    slug: string;
};
