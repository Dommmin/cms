import {
    generateProductMetadata,
    ProductPage as SharedProductPage,
} from '@/app/_routes/product-detail-page';
import type { Metadata } from 'next';
import type { PageProps } from './page.types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;

    return generateProductMetadata({ slug });
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    return <SharedProductPage slug={slug} />;
}
