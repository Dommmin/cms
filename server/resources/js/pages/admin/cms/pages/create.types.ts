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
export type ParentPage = {
    id: number;
    title: string;
    slug: string | Record<string, string>;
    children?: { id: number; title: string }[];
};
export type CreateProps = {
    modules: Record<string, ModuleConfig>;
    systemPages: Record<string, SystemPageConfig>;
    pages: ParentPage[];
    metafield_definitions: MetafieldDefinitionEntry[];
    metafields: MetafieldEntry[];
};
