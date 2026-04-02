import { apiGet, apiGetMany, apiGetPage, apiPost } from '@/lib/api';
import type { Order, PaginatedResponse, ShippingMethod } from '@/types/api';

export async function getOrders(
    params: { page?: number; per_page?: number } = {},
): Promise<PaginatedResponse<Order>> {
    return apiGetPage<Order>('/orders', { params });
}

export async function getOrder(reference: string): Promise<Order | null> {
    return apiGet<Order>(`/orders/${reference}`);
}

export async function cancelOrder(reference: string): Promise<Order | null> {
    return apiPost<Order>(`/orders/${reference}/cancel`);
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
    return apiGetMany<ShippingMethod>('/checkout/shipping-methods');
}

export interface CheckoutPayload {
    shipping_address_id: number;
    billing_address_id: number;
    shipping_method_id: number;
    payment_method: string;
    notes?: string;
}

export async function checkout(
    payload: CheckoutPayload,
): Promise<Order | null> {
    return apiPost<Order>('/checkout', payload);
}
