export type Category = { id: number; name: string };
export type BlogCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
    position: number;
};
export type EditProps = {
    category: BlogCategory;
    parentCategories: Category[];
};
