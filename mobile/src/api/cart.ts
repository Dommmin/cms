import { api, CART_TOKEN_KEY } from '@/api/client';
import { makeIdempotencyKey } from '@/lib/idempotency';
import { deleteStoredItem, getStoredItem, setStoredItem } from '@/lib/storage';
import type { Cart } from '@/types/api';

async function persistCart(cart: Cart): Promise<Cart> {
  if (cart.token) {
    await setStoredItem(CART_TOKEN_KEY, cart.token);
  }
  return cart;
}

export function getCartToken(): Promise<string | null> {
  return getStoredItem(CART_TOKEN_KEY);
}

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<Cart>('/cart');
  return persistCart(data);
}

export async function addCartItem(payload: { variant_id: number; quantity: number }): Promise<Cart> {
  const { data } = await api.post<Cart>('/cart/items', payload, {
    headers: { 'Idempotency-Key': makeIdempotencyKey('cart-add') },
  });
  return persistCart(data);
}

export async function updateCartItem(cartItemId: number, quantity: number): Promise<Cart> {
  const { data } = await api.put<Cart>(
    `/cart/items/${cartItemId}`,
    { quantity },
    { headers: { 'Idempotency-Key': makeIdempotencyKey('cart-update') } },
  );
  return persistCart(data);
}

export async function removeCartItem(cartItemId: number): Promise<Cart> {
  const { data } = await api.delete<Cart>(`/cart/items/${cartItemId}`, {
    headers: { 'Idempotency-Key': makeIdempotencyKey('cart-remove') },
  });
  return persistCart(data);
}

export async function clearCart(): Promise<void> {
  await api.delete('/cart', { headers: { 'Idempotency-Key': makeIdempotencyKey('cart-clear') } });
  await deleteStoredItem(CART_TOKEN_KEY);
}

export async function applyDiscount(code: string): Promise<Cart> {
  const { data } = await api.post<Cart | { cart: Cart }>(
    '/cart/discount',
    { code },
    { headers: { 'Idempotency-Key': makeIdempotencyKey('cart-discount') } },
  );
  return persistCart('cart' in data ? data.cart : data);
}
