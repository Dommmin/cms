import type { PageBlock } from '@/types/api';

export interface CategoriesGridConfig {
    title?: string;
    subtitle?: string;
    columns?: 2 | 3 | 4 | 6;
    show_description?: boolean;
}
export interface CategoriesGridProps {
    block: PageBlock;
}
