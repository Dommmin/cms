import { api } from "@/lib/axios";
import type { Wishlist } from "@/types/api";

export async function getWishlist(): Promise<Wishlist> {
  const { data } = await api.get<{ data: Wishlist }>("/wishlist");
  return data.data;
}

export async function addToWishlist(variantId: number): Promise<Wishlist> {
  const { data } = await api.post<{ data: Wishlist }>("/wishlist/items", {
    variant_id: variantId,
  });
  return data.data;
}

export async function removeFromWishlist(variantId: number): Promise<Wishlist> {
  const { data } = await api.delete<{ data: Wishlist }>(
    `/wishlist/items/${variantId}`,
  );
  return data.data;
}
