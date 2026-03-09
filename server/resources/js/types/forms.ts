export type Form = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    submissions_count: number;
    created_at: string;
};

export type FormsData = {
    data: Form[];
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type FormSubmission = {
    id: number;
    form_id: number;
    data: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    page_url: string | null;
    created_at: string;
};

export type SubmissionsData = {
    data: FormSubmission[];
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
