export type CookieConsent = {
    id: number;
    session_id: string;
    ip: string;
    category: string;
    granted: boolean;
    created_at: string;
};
export type ConsentsData = {
    data: CookieConsent[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    consents: ConsentsData;
    filters: { search?: string; category?: string; granted?: string };
    categories: string[];
    stats: {
        total_consents: number;
        granted_count: number;
        denied_count: number;
    };
};
