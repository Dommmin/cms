import type { PageBlock } from '@/types/api';

export interface IconListItem {
  icon?: string;
  title?: string;
  description?: string;
}
export interface IconListConfig {
  title?: string;
  subtitle?: string;
  columns?: number;
  style?: 'horizontal' | 'centered' | 'compact';
  icon_color?: string;
  items?: IconListItem[];
}
export interface IconListProps {
  block: PageBlock;
}
