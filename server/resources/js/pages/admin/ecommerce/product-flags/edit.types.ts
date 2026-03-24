export interface ProductFlag {
    id: number;
    name: string;
    slug: string;
    color: string;
    description: string | null;
    is_active: boolean;
    position: number;
}
