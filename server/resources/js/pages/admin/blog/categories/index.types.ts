export type BlogCategory = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    description: string | Record<string, string> | null;
    is_active: boolean;
    position: number;
    posts_count: number;
    parent: { id: number; name: string | Record<string, string> } | null;
};
export type CategoriesData = {
    data: BlogCategory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    categories: CategoriesData;
    filters: { search?: string; is_active?: string };
};
