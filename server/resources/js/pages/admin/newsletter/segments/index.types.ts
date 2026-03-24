export type Segment = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    campaigns_count: number;
    created_at: string;
};
export type SegmentsData = {
    data: Segment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    segments: SegmentsData;
    filters: { search?: string; is_active?: string };
};
