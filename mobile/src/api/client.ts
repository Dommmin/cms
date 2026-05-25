import { AxiosError, create, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { apiBaseUrl, defaultLocale } from '@/lib/env';
import { deleteStoredItem, getStoredItem } from '@/lib/storage';
import type { PaginatedResponse } from '@/types/api';

export const AUTH_TOKEN_KEY = 'auth_token';
export const CART_TOKEN_KEY = 'cart_token';
export const LOCALE_KEY = 'locale';

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export const api = create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getStoredItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const locale = (await getStoredItem(LOCALE_KEY)) ?? defaultLocale;
  config.params = { locale, ...config.params };

  const cartToken = await getStoredItem(CART_TOKEN_KEY);
  if (cartToken) {
    config.headers['X-Cart-Token'] = cartToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await deleteStoredItem(AUTH_TOKEN_KEY);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

function normaliseCollectionData<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'data' in data) {
    const nestedData = (data as { data?: unknown }).data;
    if (Array.isArray(nestedData)) return nestedData as T[];
  }
  return [];
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T | null> {
  const { data } = await api.get<T>(url, config);
  return data ?? null;
}

export async function apiGetMany<T>(url: string, config?: AxiosRequestConfig): Promise<T[]> {
  const { data } = await api.get<T[] | { data?: T[] } | null>(url, config);
  return normaliseCollectionData<T>(data);
}

export async function apiGetPage<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<PaginatedResponse<T>> {
  const { data } = await api.get<PaginatedResponse<T>>(url, config);
  return data;
}
