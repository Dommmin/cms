import { getCartToken } from '@/api/cart';
import { apiGet } from '@/lib/api';
import { api } from '@/lib/axios';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/api';

export type SocialProvider = 'google' | 'github';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    ...payload,
    cart_token: getCartToken(),
  });
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    ...payload,
    cart_token: getCartToken(),
  });
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<User | null> {
  return apiGet<User>('/auth/me');
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

export async function getSocialRedirectUrl(provider: SocialProvider): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/auth/social/${provider}/redirect`);
  return data.url;
}

export async function handleSocialCallback(
  provider: SocialProvider,
  code: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(`/auth/social/${provider}/callback`, { code });
  return data;
}
