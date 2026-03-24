export type TrashedUser = {
    id: number;
    name: string;
    email: string;
    deleted_at: string;
};
export type PaginatedUsers = {
    data: TrashedUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};
