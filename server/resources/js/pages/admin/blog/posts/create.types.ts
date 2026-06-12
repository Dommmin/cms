import type {
    MetafieldDefinitionEntry,
    MetafieldEntry,
} from '@/components/metafield-editor.types';

export type TagOption = { id: number; name: string; slug: string };
export type Category = { id: number; name: string };
export type CreateProps = {
    categories: Category[];
    available_tags: TagOption[];
    metafield_definitions: MetafieldDefinitionEntry[];
    metafields: MetafieldEntry[];
};
export type FormData = {
    title: Record<string, string>;
    slug: Record<string, string>;
    excerpt: Record<string, string>;
    content: Record<string, string>;
    content_json: Record<string, string>;
    content_type: 'richtext' | 'markdown';
    status: string;
    published_at: string;
    blog_category_id: string;
    tags: string[];
    available_locales: string[] | null;
    is_featured: boolean;
    featured_image: string;
    seo_title: string;
    seo_description: string;
    metafields: MetafieldEntry[];
};
