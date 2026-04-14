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
    namespace: string;
    key: string;
    name: string;
    type: string;
    description?: string | null;
}

export interface MetafieldEditorProps {
    metafields: MetafieldEntry[];
    definitions: MetafieldDefinitionEntry[];
    onChange: (metafields: MetafieldEntry[]) => void;
}
