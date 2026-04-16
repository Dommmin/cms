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
export type PriceTier = {
    id?: number;
    min_quantity: number;
    max_quantity: number | null;
    price: number; // in cents
};
export type Variant = {
    id: number;
    sku: string;
    name: string;
    price: number;
    cost_price: number;
    compare_at_price?: number | null;
    weight?: number | null;
    stock_quantity: number;
    stock_threshold: number;
    stock_status: string;
    backorder_allowed: boolean;
    available_at: string | null;
    tax_rate_id?: number | null;
    is_active: boolean;
    is_default: boolean;
    attribute_values?: Array<{ attribute_value_id: number }>;
    price_tiers: PriceTier[];
};
