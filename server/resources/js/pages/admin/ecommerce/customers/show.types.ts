export interface OrderSummary {
    id: number;
    reference_number: string;
    status: string;
    total: number;
    created_at: string;
    payment?: {
        provider: string;
        status: string;
    } | null;
}

export interface Address {
    id: number;
    first_name: string;
    last_name: string;
    street: string;
    city: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

export interface ActivityEntry {
    id: number;
    description: string;
    log_name: string | null;
    changes: { old?: Record<string, unknown>; attributes?: Record<string, unknown> } | null;
    causer: { name: string } | null;
    created_at: string;
}

export interface CustomerShow {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    company_name: string | null;
    tax_id: string | null;
    notes: string | null;
    tags: string[] | null;
    is_active: boolean;
    created_at: string;
    total_orders: number;
    total_spent: number;
    ltv_30_days: number;
    ltv_90_days: number;
    avg_order_value: number;
    last_order_at: string | null;
    orders: OrderSummary[];
    addresses: Address[];
}
