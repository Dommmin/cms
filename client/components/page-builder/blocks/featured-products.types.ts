import type { PageBlock, Product } from "@/types/api";

export interface FeaturedProductsConfig {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  view_all_url?: string;
  view_all_label?: string;
}
export interface FeaturedProductsProps {
  block: PageBlock;
}
