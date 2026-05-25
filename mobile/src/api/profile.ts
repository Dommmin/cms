import { api, apiGet } from '@/api/client';
import type { User } from '@/types/api';

export function getProfile(): Promise<User | null> {
  return apiGet<User>('/profile');
}

export async function updateProfile(payload: { name: string; email: string }): Promise<User | null> {
  const { data } = await api.put<User>('/profile', payload);
  return data ?? null;
}
