export type PrivacyRequestUser = {
    id: number;
    name: string;
    email: string;
} | null;

export type PrivacyRequest = {
    id: number;
    type: string;
    status: string;
    email: string | null;
    requested_at: string | null;
    resolved_at: string | null;
    user: PrivacyRequestUser;
};

export type PrivacyRequestsData = {
    data: PrivacyRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type IndexProps = {
    privacyRequests: PrivacyRequestsData;
    filters: { search?: string; type?: string; status?: string };
    stats: {
        total_requests: number;
        completed_requests: number;
        pending_requests: number;
    };
};
