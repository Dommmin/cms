import type { PageBlock } from '@/types/api';

export interface Testimonial {
    author: string;
    role?: string;
    avatar_url?: string;
    content: string;
    rating?: number;
}
export interface TestimonialsConfig {
    title?: string;
    subtitle?: string;
    items?: Testimonial[];
    columns?: 1 | 2 | 3;
}
export interface TestimonialsProps {
    block: PageBlock;
}
