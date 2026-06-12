export type AttributeValueFormData = {
    id?: number;
    value: string;
    slug: string;
    color_hex: string;
    position: number;
};

export type AttributeFormData = {
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
    unit: string;
    is_filterable: boolean;
    is_variant_selection: boolean;
    position: number;
    values: AttributeValueFormData[];
};
