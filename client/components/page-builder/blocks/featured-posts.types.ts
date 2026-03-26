import type { PageBlock } from '@/types/api';

export interface FeaturedPostsConfig {
  title?: string;
  subtitle?: string;
  columns?: number;
  cta_text?: string;
  cta_url?: string;
  show_excerpt?: boolean;
  show_author?: boolean;
  show_date?: boolean;
  show_category?: boolean;
  show_read_time?: boolean;
}
export interface FeaturedPostsProps {
  block: PageBlock;
}
