export type Theme = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    tokens?: Record<string, string> | null;
    is_active: boolean;
    pages_count: number;
};
export type EditProps = {
    theme: Theme;
};
