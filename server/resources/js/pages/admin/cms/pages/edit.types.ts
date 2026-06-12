import type {
    MetafieldDefinitionEntry,
    MetafieldEntry,
} from '@/components/metafield-editor.types';

export type ModuleConfig = {
    label: string;
    description?: string;
};
export type SystemPageConfig = {
    label: string;
    description?: string;
};
export type PageData = {
    id: number;
    parent_id: number | null;
    locale: string | null;
    title: Record<string, string>;
    slug: Record<string, string>;
    excerpt: Record<string, string> | null;
    content: Record<string, string> | null;
    rich_content: Record<string, string> | null;
    layout: string;
    page_type: string;
    module_name: string | null;
    system_page_key: string | null;
    module_config: Record<string, unknown> | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_canonical: string | null;
    meta_robots: string | null;
    og_image: string | null;
    sitemap_exclude: boolean;
    is_published: boolean;
};
export type ParentPage = {
    id: number;
    title: string | Record<string, string>;
    slug: string | Record<string, string>;
};
export type EditProps = {
    page: PageData;
    modules: Record<string, ModuleConfig>;
    systemPages: Record<string, SystemPageConfig>;
    pages: ParentPage[];
    metafield_definitions: MetafieldDefinitionEntry[];
    metafields: MetafieldEntry[];
};
