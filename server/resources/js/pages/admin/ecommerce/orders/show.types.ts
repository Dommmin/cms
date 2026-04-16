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
    shipped_quantity: number;
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
export type ShipmentItemView = {
    id: number;
    quantity: number;
    order_item_id: number;
    order_item?: OrderItem;
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
    carrier?: string | null;
    tracking_url?: string | null;
    created_at?: string;
    shipping_method?: { name: string } | null;
    items?: ShipmentItemView[];
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
    invoice_number?: string | null;
    invoice_issued_at?: string | null;
    buyer_vat_id?: string | null;
    buyer_company_name?: string | null;
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
    shipments?: Shipment[];
    status_history?: StatusHistory[];
};
