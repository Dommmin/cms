export interface BlogDetail {
    id: number;
    name: Record<string, string>;
    slug: string;
    description: Record<string, string> | null;
    layout: string;
    posts_per_page: number;
    commentable: boolean;
    is_active: boolean;
    available_locales: string[] | null;
    position: number;
    posts_count: number;
    default_author_id: number | null;
    seo_title: string | null;
    seo_description: string | null;
}

export interface EditProps {
    blog: BlogDetail;
    users: { id: number; name: string }[];
}
