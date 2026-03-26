import type { PageBlock } from '@/types/api';

export interface CustomHtmlConfig {
  html?: string;
  css?: string;
}
export interface CustomHtmlProps {
  block: PageBlock;
}
