export type Category = { id: number; name: string; slug: string };
export type CategoryEditProps = {
    id: number;
    name: Record<string, string>;
    slug: string;
    description?: Record<string, string>;
    parent_id?: number | null;
    is_active: boolean;
    seo_title?: string | null;
    seo_description?: string | null;
    meta_robots?: string | null;
    og_image?: string | null;
    sitemap_exclude?: boolean;
};
