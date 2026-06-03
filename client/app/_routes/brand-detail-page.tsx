import type { Metadata } from 'next';

import { getBrand } from '@/api/cms';
import ProductsClient from '@/app/products/ProductsClient';
import { generateAlternates } from '@/lib/seo';

export async function generateBrandMetadata({
    slug,
    locale,
}: {
    slug: string;
    locale?: string;
}): Promise<Metadata> {
    try {
        const brand = await getBrand(slug);

        return {
            title: brand.name,
            robots: 'index, follow',
            alternates: brand.public_url
                ? generateAlternates(brand.public_url, locale ?? 'en')
                : undefined,
        };
    } catch {
        return {};
    }
}

export async function BrandDetailPage({
    slug,
    basePath,
}: {
    slug: string;
    basePath: string;
}) {
    const brand = await getBrand(slug);

    return (
        <ProductsClient
            basePath={basePath}
            initialBrand={String(brand.id)}
            title={brand.name}
            excerpt={brand.description ?? null}
        />
    );
}
