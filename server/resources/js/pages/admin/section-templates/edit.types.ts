export type SectionTemplate = {
    id: number;
    name: string;
    section_type: string;
    variant: string | null;
    category: string | null;
    preset_data: Record<string, unknown>;
    thumbnail: string | null;
    is_global: boolean;
};
export type EditProps = {
    template: SectionTemplate;
    categories: string[];
};
