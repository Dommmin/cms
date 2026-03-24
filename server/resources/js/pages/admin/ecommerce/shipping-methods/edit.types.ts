export interface Carrier {
    value: string;
    label: string;
}
export interface ShippingMethod {
    id: number;
    name: Record<string, string>;
    description: Record<string, string> | null;
    carrier: string;
    is_active: boolean;
    base_price: number;
    price_per_kg: number;
    min_weight: number | null;
    max_weight: number | null;
    min_order_value: number | null;
    free_shipping_threshold: number | null;
    shipments_count: number;
}
