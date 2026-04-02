import { apiDelete, apiGet, apiPost } from '@/lib/api';
import type { Wishlist } from '@/types/api';

export async function getWishlist(): Promise<Wishlist | null> {
    return apiGet<Wishlist>('/wishlist');
}

export async function addToWishlist(
    variantId: number,
): Promise<Wishlist | null> {
    return apiPost<Wishlist>('/wishlist/items', { variant_id: variantId });
}

export async function removeFromWishlist(
    variantId: number,
): Promise<Wishlist | null> {
    return apiDelete<Wishlist>(`/wishlist/items/${variantId}`);
}
