export interface MetafieldDefinition {
    id: number;
    owner_type: string;
    namespace: string;
    key: string;
    name: string;
    type: string;
    description: string | null;
    pinned: boolean;
    position: number;
}

export interface EditProps {
    definition: MetafieldDefinition;
    ownerTypes: string[];
}
