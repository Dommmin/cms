export type ModuleConfig = {
    label: string;
    description?: string;
};
export type ParentPage = {
    id: number;
    title: string;
    slug: string;
    children?: { id: number; title: string }[];
};
export type CreateProps = {
    modules: Record<string, ModuleConfig>;
    pages: ParentPage[];
};
