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

        const title = category.seo_title || category.name;
        const description = category.seo_description || category.description;
        const canonical = category.canonical_url || category.public_url;

        return {
            title,
            description: description ?? undefined,
            robots: category.meta_robots ?? 'index, follow',
            alternates: canonical
                ? generateAlternates(canonical, locale ?? 'en')
                : undefined,
            openGraph: category.og_image
                ? {
                      images: [{ url: category.og_image }],
                  }
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
