import { api, AUTH_TOKEN_KEY } from '@/api/client';
import { getCartToken } from '@/api/cart';
import { deleteStoredItem, setStoredItem } from '@/lib/storage';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/api';

async function persistAuth(response: AuthResponse): Promise<AuthResponse> {
  await setStoredItem(AUTH_TOKEN_KEY, response.token);
  return response;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    ...payload,
    cart_token: await getCartToken(),
  });
  return persistAuth(data);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    ...payload,
    cart_token: await getCartToken(),
  });
  return persistAuth(data);
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
  await deleteStoredItem(AUTH_TOKEN_KEY);
}

export async function getMe(): Promise<User | null> {
  const { data } = await api.get<User | null>('/auth/me');
  return data ?? null;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', payload);
  return data;
}
