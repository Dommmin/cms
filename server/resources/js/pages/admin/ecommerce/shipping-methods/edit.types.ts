export interface Carrier {
    value: string;
    label: string;
}
export interface RestrictionItem {
    id: number;
    name: string;
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
    estimated_days_min: number | null;
    estimated_days_max: number | null;
    max_length_cm: number | null;
    max_width_cm: number | null;
    max_depth_cm: number | null;
    requires_signature: boolean;
    insurance_available: boolean;
    shipments_count: number;
}
