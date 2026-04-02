import type { PageBlock } from '@/types/api';

export interface ImageGalleryConfig {
    title?: string;
    columns?: 2 | 3 | 4;
    aspect?: 'square' | 'video' | 'portrait';
}
export interface ImageGalleryProps {
    block: PageBlock;
}
