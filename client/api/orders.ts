import { getCartToken } from '@/api/cart';
import { apiGet, apiGetMany, apiGetPage, apiPost } from '@/lib/api';
import { api } from '@/lib/axios';
import type {
    GuestOrderTrackingResult,
    Order,
    OrderReturn,
    PaginatedResponse,
    ShippingMethod,
} from '@/types/api';

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

export interface PayOrderResult {
    action: string;
    redirect_url: string | null;
}

export async function payOrder(
    reference: string,
): Promise<PayOrderResult | null> {
    return apiPost<PayOrderResult>(`/orders/${reference}/pay`);
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

export interface ReturnRequestItemPayload {
    order_item_id: number;
    quantity: number;
    notes?: string;
}

export interface ReturnRequestPayload {
    reason: string;
    notes?: string;
    type: 'return' | 'complaint' | 'exchange';
    items: ReturnRequestItemPayload[];
}

export interface GuestReturnLookupPayload {
    reference_number: string;
    email: string;
}

export interface GuestReturnRequestPayload extends ReturnRequestPayload {
    reference_number: string;
    email: string;
}

export interface ReturnRequestResult {
    message: string;
    reference_number: string;
}

export async function getReturns(
    params: { page?: number; per_page?: number } = {},
): Promise<PaginatedResponse<OrderReturn>> {
    return apiGetPage<OrderReturn>('/returns', { params });
}

export async function getReturn(
    reference: string,
): Promise<OrderReturn | null> {
    return apiGet<OrderReturn>(`/returns/${reference}`);
}

export async function lookupGuestReturnOrder(
    payload: GuestReturnLookupPayload,
): Promise<Order | null> {
    return apiPost<Order>('/returns/lookup', payload);
}

export async function submitGuestReturnRequest(
    payload: GuestReturnRequestPayload,
): Promise<ReturnRequestResult | null> {
    return apiPost<ReturnRequestResult>('/returns/guest-request', payload);
}

export async function submitOrderReturnRequest(
    reference: string,
    payload: ReturnRequestPayload,
): Promise<ReturnRequestResult | null> {
    return apiPost<ReturnRequestResult>(`/orders/${reference}/return`, payload);
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

export async function trackGuestOrder(params: {
    reference_number: string;
    email: string;
}): Promise<GuestOrderTrackingResult | null> {
    const { data } = await api.get<GuestOrderTrackingResult>('/orders/track', {
        params,
    });
    return data ?? null;
}
