export type AttributeValueFormData = {
    id?: number;
    value: string;
    slug: string;
    color_hex: string | null;
    position: number;
};

export type AttributeData = {
    id: number;
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
    is_filterable: boolean;
    is_variant_selection: boolean;
    position: number;
    values: AttributeValueFormData[];
};

export type EditAttributeProps = {
    attribute: AttributeData;
};
