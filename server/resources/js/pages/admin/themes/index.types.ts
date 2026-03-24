export type Theme = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    pages_count: number;
    created_at: string;
};
export type ThemesData = {
    data: Theme[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    themes: ThemesData;
    filters: { search?: string; is_active?: string };
};
