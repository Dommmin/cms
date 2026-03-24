export type Category = { id: number; name: string };
export type CreateProps = {
    categories: Category[];
};
export type FormData = {
    title: Record<string, string>;
    slug: string;
    excerpt: Record<string, string>;
    content: Record<string, string>;
    content_type: 'richtext' | 'markdown';
    status: string;
    published_at: string;
    blog_category_id: string;
    tags: string;
    available_locales: string[] | null;
    is_featured: boolean;
    featured_image: string;
    seo_title: string;
    seo_description: string;
};
