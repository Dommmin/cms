import { api } from '@/lib/axios';
import type { Wishlist } from '@/types/api';

const WISHLIST_TOKEN_KEY = 'wishlist_token';

export function getWishlistToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(WISHLIST_TOKEN_KEY);
}

export function setWishlistToken(token: string): void {
    localStorage.setItem(WISHLIST_TOKEN_KEY, token);
}

export function clearWishlistToken(): void {
    localStorage.removeItem(WISHLIST_TOKEN_KEY);
}

function withWishlistToken() {
    const token = getWishlistToken();
    return token ? { headers: { 'X-Wishlist-Token': token } } : {};
}

export async function getWishlist(): Promise<Wishlist | null> {
    const { data } = await api.get<Wishlist>('/wishlist', withWishlistToken());
    if (data.token) setWishlistToken(data.token);
    return data;
}

export async function addToWishlist(
    variantId: number,
): Promise<Wishlist | null> {
    const { data } = await api.post<Wishlist>(
        '/wishlist/items',
        { variant_id: variantId },
        withWishlistToken(),
    );
    if (data.token) setWishlistToken(data.token);
    return data;
}

export async function removeFromWishlist(
    variantId: number,
): Promise<Wishlist | null> {
    const { data } = await api.delete<Wishlist>(
        `/wishlist/items/${variantId}`,
        withWishlistToken(),
    );
    if (data.token) setWishlistToken(data.token);
    return data;
}
