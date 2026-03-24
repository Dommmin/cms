export type PageRow = {
    id: number;
    parent_id: number | null;
    locale: string | null;
    parent?: {
        id: number;
        title: string | Record<string, string>;
        slug: string;
    } | null;
    title: string | Record<string, string>;
    slug: string;
    page_type: string;
    module_name: string | null;
    is_published: boolean;
    updated_at: string;
};
