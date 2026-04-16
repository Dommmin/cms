export type Variant = {
    id: number;
    sku: string;
    name: string;
    price: number;
    stock_quantity: number;
    stock_status: string;
    backorder_allowed: boolean;
    is_active: boolean;
    is_default: boolean;
};
export type Product = {
    id: number;
    name: string | Record<string, string>;
};
