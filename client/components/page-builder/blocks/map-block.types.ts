import type { PageBlock } from "@/types/api";

export interface MapBlockConfig {
  store_id?: number;
  lat?: number;
  lng?: number;
  title?: string;
  zoom?: number;
  height?: number;
}
export interface MapBlockProps {
  block: PageBlock;
}
