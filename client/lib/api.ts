/**
 * Typed HTTP helpers built on top of the axios `api` instance.
 *
 * Laravel API Resources no longer wrap responses in `{ data: T }` —
 * `JsonResource::withoutWrapping()` is set globally in AppServiceProvider.
 *
 * Paginated responses still keep the `{ data: T[], meta, links }` structure
 * because that comes from Laravel's paginator, not from JsonResource.
 *
 * Use:
 *   - `apiGet<T>`      — GET single resource  → T | null
 *   - `apiGetMany<T>`  — GET collection       → T[]
 *   - `apiGetPage<T>`  — GET paginated list   → PaginatedResponse<T>
 *   - `apiPost<T>`     — POST with resource   → T | null
 *   - `apiPut<T>`      — PUT with resource    → T | null
 *   - `apiPatch<T>`    — PATCH with resource  → T | null
 *   - `apiDelete<T>`   — DELETE with resource → T | null
 *
 * For responses that don't follow this pattern (raw auth, checkout
 * responses with extra custom fields) continue using `api` directly.
 */

import type { AxiosRequestConfig } from 'axios';

import { api } from '@/lib/axios';
import type { PaginatedResponse } from '@/types/api';

function normaliseCollectionData<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === 'object' && 'data' in data) {
    const nestedData = (data as { data?: unknown }).data;

    if (Array.isArray(nestedData)) {
      return nestedData as T[];
    }
  }

  return [];
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T | null> {
  const { data } = await api.get<T>(url, config);
  return data ?? null;
}

export async function apiGetMany<T>(url: string, config?: AxiosRequestConfig): Promise<T[]> {
  const response = await api.get<T[] | { data?: T[] } | null>(url, config);
  return normaliseCollectionData<T>(response.data);
}

export async function apiGetPage<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<PaginatedResponse<T>> {
  const { data } = await api.get<PaginatedResponse<T>>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T | null> {
  const { data } = await api.post<T>(url, payload, config);
  return data ?? null;
}

export async function apiPut<T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T | null> {
  const { data } = await api.put<T>(url, payload, config);
  return data ?? null;
}

export async function apiPatch<T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T | null> {
  const { data } = await api.patch<T>(url, payload, config);
  return data ?? null;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T | null> {
  const { data } = await api.delete<T>(url, config);
  return data ?? null;
}
