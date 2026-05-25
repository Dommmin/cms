import { apiGetMany } from '@/api/client';
import type { Store } from '@/types/api';

export function getStores(): Promise<Store[]> {
  return apiGetMany<Store>('/stores');
}
