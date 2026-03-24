export type SectionTemplate = {
    id: number;
    name: string;
    section_type: string;
    variant: string | null;
    category: string | null;
    is_global: boolean;
    thumbnail: string | null;
    created_at: string;
};
export type TemplatesData = {
    data: SectionTemplate[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    templates: TemplatesData;
    categories: string[];
    filters: { search?: string; category?: string };
};
