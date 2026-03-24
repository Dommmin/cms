export type Category = { id: number; name: string | Record<string, string> };
export type BlogPost = {
    id: number;
    title: string | Record<string, string>;
    slug: string;
    status: string;
    content_type: string;
    is_featured: boolean;
    views_count: number;
    published_at: string | null;
    created_at: string;
    category: Category | null;
    author: { id: number; name: string } | null;
};
export type PostsData = {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type StatusOption = { value: string; label: string };
export type IndexProps = {
    posts: PostsData;
    filters: {
        search?: string;
        category_id?: string;
        status?: string;
        content_type?: string;
    };
    statuses: StatusOption[];
    categories: { id: number; name: string }[];
};
