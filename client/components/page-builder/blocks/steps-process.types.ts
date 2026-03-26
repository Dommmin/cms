import type { PageBlock } from '@/types/api';

export interface Step {
  title?: string;
  description?: string;
  icon?: string;
}
export interface StepsProcessConfig {
  title?: string;
  subtitle?: string;
  layout?: 'horizontal' | 'vertical' | 'numbered';
  steps?: Step[];
}
export interface StepsProcessProps {
  block: PageBlock;
}
