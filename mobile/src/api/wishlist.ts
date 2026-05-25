import { api, apiGet } from '@/api/client';
import type { Wishlist } from '@/types/api';

export function getWishlist(): Promise<Wishlist | null> {
  return apiGet<Wishlist>('/wishlist');
}

export async function addToWishlist(variantId: number): Promise<Wishlist | null> {
  const { data } = await api.post<Wishlist>('/wishlist/items', { variant_id: variantId });
  return data ?? null;
}

export async function removeFromWishlist(variantId: number): Promise<Wishlist | null> {
  const { data } = await api.delete<Wishlist>(`/wishlist/items/${variantId}`);
  return data ?? null;
}
