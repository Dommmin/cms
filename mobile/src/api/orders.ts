import { apiGet, apiGetPage } from '@/api/client';
import type { Order, PaginatedResponse } from '@/types/api';

export function getOrders(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResponse<Order>> {
  return apiGetPage<Order>('/orders', { params });
}

export function getOrder(reference: string): Promise<Order | null> {
  return apiGet<Order>(`/orders/${reference}`);
}
