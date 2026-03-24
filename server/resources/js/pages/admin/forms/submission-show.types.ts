export type SubmissionData = {
    id: number;
    form_id: number;
    data: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    page_url: string | null;
    created_at: string;
};
export type FormData = {
    id: number;
    name: string;
    slug: string;
};
