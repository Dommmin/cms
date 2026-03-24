export type Segment = {
    id: number;
    name: string;
};
export type Campaign = {
    id: number;
    name: string;
    subject: string;
    status: string;
    type: string;
    segment?: Segment | null;
    total_sent: number;
    scheduled_at: string | null;
    created_at: string;
};
export type CampaignsData = {
    data: Campaign[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    campaigns: CampaignsData;
    filters: { search?: string; status?: string; type?: string };
};
