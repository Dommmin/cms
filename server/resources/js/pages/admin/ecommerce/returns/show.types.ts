export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}
export interface Order {
    id: number;
    order_number: string;
    customer: Customer | null;
}
export interface ProductVariant {
    id: number;
    sku: string;
    name: string;
    product: { id: number; name: string } | null;
}
export interface ReturnItem {
    id: number;
    quantity: number;
    condition: string | null;
    notes: string | null;
    order_item_id: number;
    product_variant: ProductVariant | null;
}
export interface StatusHistoryEntry {
    id: number;
    previous_status: string;
    new_status: string;
    changed_by: string;
    notes: string | null;
    changed_at: string;
}
export interface ReturnRequest {
    id: number;
    reference_number: string;
    status: string;
    return_type: string;
    reason: string | null;
    customer_notes: string | null;
    admin_notes: string | null;
    return_tracking_number: string | null;
    refund_amount: number | null;
    created_at: string;
    order: Order;
    items: ReturnItem[];
    status_history: StatusHistoryEntry[];
}
