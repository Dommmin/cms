import { getCartToken } from '@/api/cart';
import { apiGet, apiGetMany, apiGetPage, apiPost } from '@/lib/api';
import { api } from '@/lib/axios';
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

export interface ReorderResult {
    cart_token: string | null;
    added: number;
    skipped: number;
    message: string;
}

export async function reorder(
    reference: string,
): Promise<ReorderResult | null> {
    const cartToken = getCartToken();
    const { data } = await api.post<ReorderResult>(
        `/orders/${reference}/reorder`,
        {},
        cartToken ? { headers: { 'X-Cart-Token': cartToken } } : {},
    );
    return data ?? null;
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
