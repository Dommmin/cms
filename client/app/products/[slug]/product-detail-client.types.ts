import type { Product } from '@/types/api';

export interface ProductDetailClientProps {
    slug: string;
    basePath: string;
    initialProduct?: Product;
}
