export type Address = {
    first_name: string;
    last_name: string;
    company_name?: string;
    street: string;
    city: string;
    postal_code: string;
    country_code: string;
    phone?: string;
};
export type Customer = {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    user?: { name: string; email: string };
};
export type OrderItem = {
    id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product_name?: string;
    sku?: string;
    variant?: {
        sku?: string;
        attributes?: Record<string, string>;
        product?: { name: string; slug: string };
    };
};
export type Payment = {
    id: number;
    provider: string;
    status: string;
    amount: number;
    currency_code: string;
};
export type Shipment = {
    id: number;
    status: string;
    tracking_number?: string | null;
    carrier?: string;
    shipping_method?: { name: string };
};
export type StatusHistory = {
    id: number;
    previous_status: string;
    new_status: string;
    changed_by: string;
    notes?: string | null;
    changed_at: string;
};
export type StatusOption = { value: string; label: string; color: string };
export type OrderView = {
    id: number;
    reference_number: string;
    customer?: Customer;
    billing_address?: Address;
    shipping_address?: Address;
    status: string;
    subtotal: number;
    discount_amount: number;
    shipping_cost: number;
    tax_amount: number;
    total: number;
    currency_code: string;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
    payment?: Payment | null;
    shipment?: Shipment | null;
    status_history?: StatusHistory[];
};
