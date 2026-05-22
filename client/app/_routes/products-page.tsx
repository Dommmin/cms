import type { Metadata } from 'next';
import { Suspense } from 'react';

import ProductsClient from '@/app/products/ProductsClient';
import {
    getDefaultLocale,
    getI18nConfig,
    resolveLocale,
} from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';

export async function generateProductsMetadata(
    locale?: string,
): Promise<Metadata> {
    const i18nConfig = await getI18nConfig();
    const resolvedLocale = locale
        ? await resolveLocale(locale)
        : await getDefaultLocale();

    return {
        title: 'Shop',
        description: 'Browse our products',
        alternates: generateAlternates('/products', resolvedLocale, i18nConfig),
    };
}

export function ProductsPage() {
    return (
        <Suspense>
            <ProductsClient />
        </Suspense>
    );
}
