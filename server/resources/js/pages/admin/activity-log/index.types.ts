export type ActivityLog = {
    id: number;
    log_name: string;
    description: string;
    event: string | null;
    subject_type: string | null;
    subject_id: number | null;
    causer: { id: number; name: string; email: string } | null;
    properties: {
        attributes?: Record<string, unknown>;
        old?: Record<string, unknown>;
    } | null;
    created_at: string;
};
export type PaginatedActivities = {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type User = { id: number; name: string; email: string };
export type IndexProps = {
    activities: PaginatedActivities;
    users: User[];
    log_names: string[];
    filters: {
        causer_id?: string;
        log_name?: string;
        event?: string;
        date_from?: string;
        date_to?: string;
    };
};
