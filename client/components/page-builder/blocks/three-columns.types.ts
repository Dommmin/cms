import type { PageBlock } from '@/types/api';

export interface ThreeColumnsConfig {
  column_1_title?: string;
  column_1_content?: string;
  column_2_title?: string;
  column_2_content?: string;
  column_3_title?: string;
  column_3_content?: string;
  vertical_alignment?: 'top' | 'middle' | 'bottom';
}
export interface ThreeColumnsProps {
  block: PageBlock;
}
