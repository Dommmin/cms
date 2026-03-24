export type Subscriber = {
    id: number;
    email: string;
    first_name: string | null;
    is_active: boolean;
    is_bounced: boolean;
    tags: string[];
    created_at: string;
};
export type SubscribersData = {
    data: Subscriber[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    subscribers: SubscribersData;
    filters: { search?: string; is_active?: string; is_bounced?: string };
};
