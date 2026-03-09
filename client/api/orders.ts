import { api } from "@/lib/axios";
import type { Order, PaginatedResponse, ShippingMethod } from "@/types/api";

export async function getOrders(
  params: { page?: number; per_page?: number } = {},
): Promise<PaginatedResponse<Order>> {
  const { data } = await api.get<PaginatedResponse<Order>>("/orders", { params });
  return data;
}

export async function getOrder(reference: string): Promise<Order> {
  const { data } = await api.get<{ data: Order }>(`/orders/${reference}`);
  return data.data;
}

export async function cancelOrder(reference: string): Promise<Order> {
  const { data } = await api.post<{ data: Order }>(`/orders/${reference}/cancel`);
  return data.data;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const { data } = await api.get<{ data: ShippingMethod[] }>("/checkout/shipping-methods");
  return data.data;
}

export interface CheckoutPayload {
  shipping_address_id: number;
  billing_address_id: number;
  shipping_method_id: number;
  payment_method: string;
  notes?: string;
}

export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const { data } = await api.post<{ data: Order }>("/checkout", payload);
  return data.data;
}
