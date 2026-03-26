import type { PageBlock } from '@/types/api';

export interface CountdownTimerConfig {
  title?: string;
  subtitle?: string;
  target_date?: string;
  show_labels?: boolean;
  expired_message?: string;
  cta_label?: string;
  cta_url?: string;
  style?: 'light' | 'dark' | 'brand';
}
export interface CountdownTimerProps {
  block: PageBlock;
}
