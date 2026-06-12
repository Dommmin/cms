export type CoreAttributeOption = {
    id: number;
    value: string;
    slug: string;
    color_hex: string | null;
};

export type CoreAttributeSchemaItem = {
    attribute_id: number;
    name: string;
    slug: string;
    type:
        | 'text'
        | 'numeric'
        | 'boolean'
        | 'select'
        | 'multiselect'
        | 'color'
        | 'date';
    unit: string | null;
    is_required: boolean;
    position: number;
    is_inherited: boolean;
    options: CoreAttributeOption[];
};

export type ProductAttributeFormValue = {
    attribute_id: number;
    value: string;
    option_id: number | null;
    option_ids: number[];
};
