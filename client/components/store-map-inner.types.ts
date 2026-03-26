import type { Store } from '@/types/api';

export interface StoreMapInnerProps {
  stores: Store[];
  height?: number;
  zoom?: number;
}
