import { apiDelete, apiGet, apiGetMany, apiPost, apiPut } from '@/lib/api';
import { api } from '@/lib/axios';
import type {
    Address,
    UpdatePasswordPayload,
    UpdateProfilePayload,
    User,
} from '@/types/api';

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<User | null> {
    return apiGet<User>('/profile');
}

export async function updateProfile(
    payload: UpdateProfilePayload,
): Promise<User | null> {
    return apiPut<User>('/profile', payload);
}

export async function updatePassword(
    payload: UpdatePasswordPayload,
): Promise<void> {
    await api.put('/profile/password', payload);
}

export async function deleteAccount(password: string): Promise<void> {
    await api.delete('/profile', { data: { password } });
}

export async function exportData(): Promise<Blob> {
    const { data } = await api.get('/profile/export', { responseType: 'blob' });
    return data as Blob;
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export async function getAddresses(): Promise<Address[]> {
    return apiGetMany<Address>('/addresses');
}

export async function createAddress(
    payload: Omit<Address, 'id' | 'is_default'>,
): Promise<Address | null> {
    return apiPost<Address>('/addresses', payload);
}

export async function updateAddress(
    id: number,
    payload: Partial<Omit<Address, 'id'>>,
): Promise<Address | null> {
    return apiPut<Address>(`/addresses/${id}`, payload);
}

export async function deleteAddress(id: number): Promise<void> {
    await apiDelete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: number): Promise<Address | null> {
    return apiPost<Address>(`/addresses/${id}/default`);
}
