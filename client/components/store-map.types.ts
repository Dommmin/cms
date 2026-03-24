import type { Store } from "@/types/api";

export interface StoreMapProps {
  stores: Store[];
  height?: number;
  zoom?: number;
}
