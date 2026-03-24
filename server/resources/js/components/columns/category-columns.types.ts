export type CategoryRow = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    description?: string | Record<string, string> | null;
    is_active: boolean;
    parent_id?: number | null;
    parent?: { id: number; name: string | Record<string, string> } | null;
    children?: CategoryRow[];
    products_count?: number;
    depth?: number;
};
