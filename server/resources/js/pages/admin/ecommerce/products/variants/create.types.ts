export type Product = {
    id: number;
    name: string | Record<string, string>;
};
export type TaxRate = {
    id: number;
    name: string;
    rate: number;
};
export type VariantAttribute = {
    id: number;
    name: string;
    slug: string;
    is_required: boolean;
    values: Array<{ id: number; value: string; slug: string }>;
};
