export interface Blog {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    layout: string;
    posts_per_page: number;
    commentable: boolean;
    is_active: boolean;
    position: number;
    posts_count: number;
    created_at: string;
}

export interface IndexProps {
    blogs: {
        data: Blog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { search?: string };
}
