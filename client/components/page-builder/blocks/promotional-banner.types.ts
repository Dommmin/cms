import type { PageBlock } from '@/types/api';

export interface PromotionalBannerConfig {
  title?: string;
  subtitle?: string;
  badge_text?: string;
  cta_text?: string;
  cta_url?: string;
  layout?: 'left' | 'right' | 'center';
  background_color?: string;
}
export interface PromotionalBannerProps {
  block: PageBlock;
}
