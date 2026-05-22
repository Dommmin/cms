import type { Metadata } from 'next';

import ProductDetailClient from '@/app/products/[slug]/ProductDetailClient';
import {
    getDefaultLocale,
    getI18nConfig,
    resolveLocale,
} from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';
import { serverFetch } from '@/lib/server-fetch';
import type { Product } from '@/types/api';

export async function generateProductMetadata({
    slug,
    locale,
}: {
    slug: string;
    locale?: string;
}): Promise<Metadata> {
    try {
        const resolvedLocale = locale
            ? await resolveLocale(locale)
            : await getDefaultLocale();
        const i18nConfig = await getI18nConfig();
        const product = await serverFetch<Product>(`/products/${slug}`, {
            locale: resolvedLocale,
        });

        return {
            title: product.seo_title ?? product.name,
            description:
                product.seo_description ??
                product.short_description ??
                undefined,
            robots: product.meta_robots ?? 'index, follow',
            alternates: generateAlternates(
                `/products/${slug}`,
                resolvedLocale,
                i18nConfig,
            ),
            openGraph: {
                title: product.seo_title ?? product.name,
                description:
                    product.seo_description ??
                    product.short_description ??
                    undefined,
                images: product.og_image
                    ? [product.og_image]
                    : product.images?.[0]?.url
                      ? [product.images[0].url]
                      : [],
                type: 'website',
            },
            twitter: { card: 'summary_large_image' },
        };
    } catch {
        return {};
    }
}

export function ProductPage({ slug }: { slug: string }) {
    return <ProductDetailClient slug={slug} />;
}
