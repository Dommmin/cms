import type {
    MetafieldDefinitionEntry,
    MetafieldEntry,
} from '@/components/metafield-editor.types';

export type Category = { id: number; name: string; slug: string };

export type CollectionRule = {
    field: string;
    condition: string;
    value: string;
};

export type CreateProps = {
    categories: Category[];
    available_attributes: unknown[];
    metafield_definitions: MetafieldDefinitionEntry[];
    metafields: MetafieldEntry[];
};
