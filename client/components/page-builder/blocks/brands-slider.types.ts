import type { PageBlock } from '@/types/api';

export interface BrandsSliderConfig {
    title?: string;
    source?: 'all' | 'manual';
    speed?: 'slow' | 'normal' | 'fast';
    logo_height?: number;
    grayscale?: boolean;
}
export interface BrandsSliderProps {
    block: PageBlock;
}
