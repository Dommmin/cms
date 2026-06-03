import type { Metadata } from 'next';

import { getCategory } from '@/api/cms';
import ProductsClient from '@/app/products/ProductsClient';
import { generateAlternates } from '@/lib/seo';

export async function generateCategoryMetadata({
    slug,
    locale,
}: {
    slug: string;
    locale?: string;
}): Promise<Metadata> {
    try {
        const response = await getCategory(slug);
        const category = response.category;

        return {
            title: category.name,
            description: category.description ?? undefined,
            robots: 'index, follow',
            alternates: category.public_url
                ? generateAlternates(category.public_url, locale ?? 'en')
                : undefined,
        };
    } catch {
        return {};
    }
}

export async function CategoryDetailPage({
    slug,
    basePath,
}: {
    slug: string;
    basePath: string;
}) {
    const response = await getCategory(slug);
    const category = response.category;

    return (
        <ProductsClient
            basePath={basePath}
            initialCategory={category.slug}
            title={category.name}
            excerpt={category.description}
        />
    );
}
