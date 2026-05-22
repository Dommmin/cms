import {
    generateProductsMetadata,
    ProductsPage as SharedProductsPage,
} from '@/app/_routes/products-page';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    return generateProductsMetadata();
}

export default function ProductsPage() {
    return <SharedProductsPage />;
}
