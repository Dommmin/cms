import type { PageBlock } from '@/types/api';

export interface VideoEmbedConfig {
  title?: string;
  url?: string;
  /** youtube | vimeo | custom */
  provider?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspect?: 'video' | 'square' | 'portrait';
}
export interface VideoEmbedProps {
  block: PageBlock;
}
