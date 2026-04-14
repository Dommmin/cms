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

export interface IndexProps {
    definitions: {
        data: MetafieldDefinition[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { search?: string; owner_type?: string };
    ownerTypes: string[];
}
