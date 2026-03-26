import { api } from '@/lib/axios';
import type { Cart } from '@/types/api';

const CART_TOKEN_KEY = 'cart_token';

export function getCartToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(CART_TOKEN_KEY);
}

export function setCartToken(token: string): void {
  localStorage.setItem(CART_TOKEN_KEY, token);
}

function withCartToken() {
  const token = getCartToken();
  return token ? { headers: { 'X-Cart-Token': token } } : {};
}

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<Cart>('/cart', withCartToken());
  if (data.token) setCartToken(data.token);
  return data;
}

export async function addCartItem(payload: {
  variant_id: number;
  quantity: number;
}): Promise<Cart> {
  const { data } = await api.post<Cart>('/cart/items', payload, withCartToken());
  if (data.token) setCartToken(data.token);
  return data;
}

export async function updateCartItem(cartItemId: number, quantity: number): Promise<Cart> {
  const { data } = await api.put<Cart>(`/cart/items/${cartItemId}`, { quantity }, withCartToken());
  return data;
}

export async function removeCartItem(cartItemId: number): Promise<Cart> {
  const { data } = await api.delete<Cart>(`/cart/items/${cartItemId}`, withCartToken());
  return data;
}

export async function clearCart(): Promise<void> {
  await api.delete('/cart', withCartToken());
}

export async function applyDiscount(code: string): Promise<Cart> {
  const { data } = await api.post<{ cart: Cart }>('/cart/discount', { code }, withCartToken());
  return data.cart;
}

export async function removeDiscount(): Promise<Cart> {
  const { data } = await api.delete<Cart>('/cart/discount', withCartToken());
  return data;
}
