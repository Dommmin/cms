import { api, apiGet, apiGetMany } from '@/api/client';
import type { Address, ConsentPreferences, UpdatePasswordPayload, User } from '@/types/api';

export function getProfile(): Promise<User | null> {
  return apiGet<User>('/profile');
}

export async function updateProfile(payload: { name: string; email: string }): Promise<User | null> {
  const { data } = await api.put<User>('/profile', payload);
  return data ?? null;
}

export async function updatePassword(payload: UpdatePasswordPayload): Promise<void> {
  await api.put('/profile/password', payload);
}

export function exportProfileData(): Promise<Record<string, unknown> | null> {
  return apiGet<Record<string, unknown>>('/profile/export');
}

export async function restrictProcessing(): Promise<void> {
  await api.post('/profile/restrict-processing', {});
}

export async function liftProcessingRestriction(): Promise<void> {
  await api.delete('/profile/restrict-processing');
}

export async function deleteAccount(password: string): Promise<void> {
  await api.delete('/profile', { data: { password } });
}

export function getConsent(): Promise<ConsentPreferences | null> {
  return apiGet<ConsentPreferences>('/consent');
}

export async function updateConsent(payload: ConsentPreferences): Promise<void> {
  await api.post('/consent', payload);
}

export function getAddresses(): Promise<Address[]> {
  return apiGetMany<Address>('/addresses');
}
