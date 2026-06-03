import Link from 'next/link';

import { getBrands, getCategories } from '@/api/cms';
import ProductsClient from '@/app/products/ProductsClient';
import { localePath } from '@/lib/i18n';
import { resolveBrandPath, resolveCategoryPath } from '@/lib/public-paths';
import type { StorefrontListingModuleProps } from './storefront-listing-modules.types';

export function ProductListingModule({ page }: StorefrontListingModuleProps) {
    return (
        <ProductsClient
            basePath={page.path}
            title={page.title}
            excerpt={page.excerpt}
        />
    );
}

export async function CategoryListingModule({
    page,
    locale,
}: StorefrontListingModuleProps) {
    const categories = await getCategories();

    return (
        <div className="store-wide-shell mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
            <header className="mx-auto mb-10 max-w-3xl text-center">
                <h1 className="text-4xl font-semibold sm:text-5xl">
                    {page.title}
                </h1>
                {page.excerpt && (
                    <p className="text-muted-foreground mt-4 text-lg">
                        {page.excerpt}
                    </p>
                )}
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={localePath(locale, resolveCategoryPath(category))}
                        className="border-border bg-card hover:border-primary rounded-2xl border p-5 transition-colors"
                    >
                        <h2 className="text-lg font-semibold">
                            {category.name}
                        </h2>
                        {category.description && (
                            <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
                                {category.description}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export async function BrandListingModule({
    page,
    locale,
}: StorefrontListingModuleProps) {
    const brands = await getBrands();

    return (
        <div className="store-wide-shell mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
            <header className="mx-auto mb-10 max-w-3xl text-center">
                <h1 className="text-4xl font-semibold sm:text-5xl">
                    {page.title}
                </h1>
                {page.excerpt && (
                    <p className="text-muted-foreground mt-4 text-lg">
                        {page.excerpt}
                    </p>
                )}
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {brands.map((brand) => (
                    <Link
                        key={brand.id}
                        href={localePath(locale, resolveBrandPath(brand))}
                        className="border-border bg-card hover:border-primary rounded-2xl border p-5 transition-colors"
                    >
                        <h2 className="text-lg font-semibold">{brand.name}</h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}
