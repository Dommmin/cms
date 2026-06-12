export interface MetafieldEntry {
    id?: number;
    namespace: string;
    key: string;
    type: string;
    value: string | null;
    description?: string | null;
    _delete?: boolean;
}

export interface MetafieldDefinitionEntry {
    id?: number;
    namespace: string;
    key: string;
    name: string;
    type: string;
    description?: string | null;
    visibility?: string;
    storefront_exposed?: boolean;
    pinned?: boolean;
    position?: number;
}

export interface MetafieldEditorProps {
    metafields: MetafieldEntry[];
    definitions: MetafieldDefinitionEntry[];
    onChange: (metafields: MetafieldEntry[]) => void;
    allowCustomFields?: boolean;
}
