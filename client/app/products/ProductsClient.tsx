'use client';

import { LayoutGrid, LayoutList, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ProductFilters } from '@/api/products';
import { BackToTop } from '@/components/back-to-top';
import { CategoryBanner } from '@/components/category-banner';
import { ProductCard } from '@/components/product-card';
import { ProductListItem } from '@/components/product-list-item';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useLocalePath } from '@/hooks/use-locale';
import { useProducts } from '@/hooks/use-products';
import { useTranslation } from '@/hooks/use-translation';
import type { PendingFilters, ViewMode } from './ProductsClient.types';

function pendingFromSearchParams(
    searchParams: URLSearchParams,
): PendingFilters {
    const attributes = Array.from(searchParams.entries()).reduce<
        Record<string, string[]>
    >((acc, [key, value]) => {
        if (!key.startsWith('attr_') || value.trim() === '') return acc;
        acc[key.replace('attr_', '')] = value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
        return acc;
    }, {});

    return {
        brand: searchParams.get('brand') ?? '',
        min_price: searchParams.get('min_price') ?? '',
        max_price: searchParams.get('max_price') ?? '',
        in_stock: searchParams.get('in_stock') === '1',
        attributes,
    };
}

export default function ProductsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const lp = useLocalePath();
    const { t } = useTranslation();

    const SORT_OPTIONS = [
        { value: '', label: t('shop.sort_default', 'Default') },
        {
            value: 'price',
            label: t('shop.sort_price_asc', 'Price: Low to High'),
        },
        {
            value: '-price',
            label: t('shop.sort_price_desc', 'Price: High to Low'),
        },
        { value: '-created_at', label: t('shop.sort_newest', 'Newest') },
        { value: '-rating', label: t('shop.sort_rating', 'Top Rated') },
    ];

    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [pending, setPending] = useState<PendingFilters>(() =>
        pendingFromSearchParams(searchParams),
    );

    useEffect(() => {
        const stored = localStorage.getItem('products_view_mode');
        if (stored === 'list' || stored === 'grid') setViewMode(stored);
    }, []);

    // Sync pending state when URL changes (browser back/forward, external navigation)
    useEffect(() => {
        setPending(pendingFromSearchParams(searchParams));
    }, [searchParams]);

    function changeViewMode(mode: ViewMode) {
        setViewMode(mode);
        localStorage.setItem('products_view_mode', mode);
    }

    // Applied filters — always derived from URL (source of truth for the API call)
    const appliedFilters: ProductFilters = {
        page: Number(searchParams.get('page') ?? 1),
        search: searchParams.get('search') ?? undefined,
        category: searchParams.get('category') ?? undefined,
        brand: searchParams.get('brand') ?? undefined,
        sort: searchParams.get('sort') ?? undefined,
        min_price: searchParams.get('min_price')
            ? Number(searchParams.get('min_price'))
            : undefined,
        max_price: searchParams.get('max_price')
            ? Number(searchParams.get('max_price'))
            : undefined,
        in_stock: searchParams.get('in_stock') === '1' ? true : undefined,
        attributes: Array.from(searchParams.entries()).reduce<
            Record<string, string[]>
        >((acc, [key, value]) => {
            if (!key.startsWith('attr_') || value.trim() === '') return acc;
            acc[key.replace('attr_', '')] = value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean);
            return acc;
        }, {}),
    };

    const { data, isLoading, isFetching } = useProducts(appliedFilters);
    const availableFilters = data?.meta?.available_filters;

    // Whether pending state differs from what's currently applied in the URL
    const hasChanges =
        pending.brand !== (searchParams.get('brand') ?? '') ||
        pending.min_price !== (searchParams.get('min_price') ?? '') ||
        pending.max_price !== (searchParams.get('max_price') ?? '') ||
        pending.in_stock !== (searchParams.get('in_stock') === '1') ||
        JSON.stringify(pending.attributes) !==
            JSON.stringify(
                Array.from(searchParams.entries()).reduce<
                    Record<string, string[]>
                >((acc, [key, value]) => {
                    if (!key.startsWith('attr_') || value.trim() === '')
                        return acc;
                    acc[key.replace('attr_', '')] = value
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean);
                    return acc;
                }, {}),
            );

    function applyFilters() {
        const params = new URLSearchParams(searchParams.toString());

        // Apply pending filter values to URL params
        if (pending.brand) params.set('brand', pending.brand);
        else params.delete('brand');

        if (pending.min_price) params.set('min_price', pending.min_price);
        else params.delete('min_price');

        if (pending.max_price) params.set('max_price', pending.max_price);
        else params.delete('max_price');

        if (pending.in_stock) params.set('in_stock', '1');
        else params.delete('in_stock');

        // Clear old attribute params, then set new ones
        Array.from(params.keys())
            .filter((k) => k.startsWith('attr_'))
            .forEach((k) => params.delete(k));

        Object.entries(pending.attributes).forEach(([slug, values]) => {
            if (values.length > 0) params.set(`attr_${slug}`, values.join(','));
        });

        params.delete('page');
        router.push(lp(`/products?${params.toString()}`));
    }

    function clearFilters() {
        const params = new URLSearchParams();
        if (searchParams.get('search'))
            params.set('search', searchParams.get('search')!);
        if (searchParams.get('sort'))
            params.set('sort', searchParams.get('sort')!);
        if (searchParams.get('category'))
            params.set('category', searchParams.get('category')!);
        router.push(lp(`/products?${params.toString()}`));
    }

    function togglePendingAttribute(attributeSlug: string, valueSlug: string) {
        setPending((prev) => {
            const current = prev.attributes[attributeSlug] ?? [];
            const next = current.includes(valueSlug)
                ? current.filter((v) => v !== valueSlug)
                : [...current, valueSlug];

            const attributes = { ...prev.attributes };
            if (next.length > 0) attributes[attributeSlug] = next;
            else delete attributes[attributeSlug];

            return { ...prev, attributes };
        });
    }

    // Sort and search apply immediately — outside the filter panel
    function setParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        if (key !== 'page') params.delete('page');
        router.push(lp(`/products?${params.toString()}`));
    }

    function buildPaginationItems(
        currentPage: number,
        lastPage: number,
    ): Array<number | 'ellipsis'> {
        const pages = new Set<number>([1, lastPage]);

        for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
            if (page > 1 && page < lastPage) pages.add(page);
        }

        const sortedPages = Array.from(pages).sort((a, b) => a - b);
        const items: Array<number | 'ellipsis'> = [];

        sortedPages.forEach((page, index) => {
            if (index > 0 && page - sortedPages[index - 1] > 1)
                items.push('ellipsis');
            items.push(page);
        });

        return items;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {appliedFilters.category && (
                <CategoryBanner slug={appliedFilters.category} />
            )}
            {/* Header row */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {t('shop.title', 'Shop')}
                    </h1>
                    {data && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            {data.meta?.total ?? data.data?.length ?? 0}{' '}
                            {t('shop.products_suffix', 'products')}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <label htmlFor="products-search" className="sr-only">
                        {t('shop.search_placeholder', 'Search products…')}
                    </label>
                    <input
                        id="products-search"
                        type="search"
                        placeholder={t(
                            'shop.search_placeholder',
                            'Search products…',
                        )}
                        defaultValue={appliedFilters.search ?? ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setParam(
                                    'search',
                                    (e.target as HTMLInputElement).value,
                                );
                            }
                        }}
                        className="border-input bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                    />
                    {/* Sort */}
                    <label htmlFor="products-sort" className="sr-only">
                        {t('shop.sort_label', 'Sort products')}
                    </label>
                    <select
                        id="products-sort"
                        value={appliedFilters.sort ?? ''}
                        onChange={(e) => setParam('sort', e.target.value)}
                        className="border-input bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>

                    {/* View mode toggle */}
                    <div
                        role="group"
                        aria-label={t('shop.view_mode', 'View mode')}
                        className="border-input flex overflow-hidden rounded-md border"
                    >
                        <button
                            onClick={() => changeViewMode('grid')}
                            aria-label={t('shop.view_grid', 'Grid view')}
                            aria-pressed={viewMode === 'grid'}
                            className={`inline-flex items-center px-2.5 py-1.5 transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-accent'
                            }`}
                        >
                            <LayoutGrid
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>
                        <button
                            onClick={() => changeViewMode('list')}
                            aria-label={t('shop.view_list', 'List view')}
                            aria-pressed={viewMode === 'list'}
                            className={`border-input inline-flex items-center border-l px-2.5 py-1.5 transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-accent'
                            }`}
                        >
                            <LayoutList
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        aria-controls="products-filters-panel"
                        className="border-input bg-background hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                    >
                        <SlidersHorizontal
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                        {t('shop.filters', 'Filters')}
                    </button>
                </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div
                    id="products-filters-panel"
                    className="border-border bg-card mb-6 space-y-5 rounded-xl border p-4"
                >
                    {availableFilters && (
                        <div className="grid gap-5 lg:grid-cols-3">
                            <div>
                                <label
                                    htmlFor="products-brand"
                                    className="text-muted-foreground mb-1 block text-xs font-medium"
                                >
                                    {t('shop.brand', 'Brand')}
                                </label>
                                <select
                                    id="products-brand"
                                    value={pending.brand}
                                    onChange={(e) =>
                                        setPending((prev) => ({
                                            ...prev,
                                            brand: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                                >
                                    <option value="">
                                        {t('shop.all_brands', 'All brands')}
                                    </option>
                                    {availableFilters.brands.map((brand) => (
                                        <option
                                            key={brand.id}
                                            value={String(brand.id)}
                                        >
                                            {brand.label} ({brand.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="products-min-price"
                                    className="text-muted-foreground mb-1 block text-xs font-medium"
                                >
                                    {t('shop.min_price', 'Min Price')} (€)
                                </label>
                                <input
                                    id="products-min-price"
                                    type="number"
                                    value={pending.min_price}
                                    onChange={(e) =>
                                        setPending((prev) => ({
                                            ...prev,
                                            min_price: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="products-max-price"
                                    className="text-muted-foreground mb-1 block text-xs font-medium"
                                >
                                    {t('shop.max_price', 'Max Price')} (€)
                                </label>
                                <input
                                    id="products-max-price"
                                    type="number"
                                    value={pending.max_price}
                                    onChange={(e) =>
                                        setPending((prev) => ({
                                            ...prev,
                                            max_price: e.target.value,
                                        }))
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {availableFilters &&
                        availableFilters.attributes.length > 0 && (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {availableFilters.attributes.map(
                                    (attribute) => (
                                        <div key={attribute.slug}>
                                            <p className="text-muted-foreground mb-2 text-xs font-medium">
                                                {attribute.label}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {attribute.values.map(
                                                    (value) => {
                                                        const isSelected =
                                                            pending.attributes[
                                                                attribute.slug
                                                            ]?.includes(
                                                                value.slug,
                                                            ) ?? false;

                                                        return (
                                                            <button
                                                                key={`${attribute.slug}-${value.slug}`}
                                                                type="button"
                                                                onClick={() =>
                                                                    togglePendingAttribute(
                                                                        attribute.slug,
                                                                        value.slug,
                                                                    )
                                                                }
                                                                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                                                    isSelected
                                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                                        : 'border-input bg-background hover:bg-accent'
                                                                }`}
                                                            >
                                                                {value.label} (
                                                                {value.count})
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-6">
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={pending.in_stock}
                                    onChange={(e) =>
                                        setPending((prev) => ({
                                            ...prev,
                                            in_stock: e.target.checked,
                                        }))
                                    }
                                    className="accent-primary h-4 w-4 rounded"
                                />
                                {t('shop.in_stock_only', 'In stock only')}
                            </label>
                            <button
                                onClick={clearFilters}
                                className="border-input bg-background hover:bg-accent rounded-md border px-3 py-1.5 text-sm"
                            >
                                {t('shop.clear_filters', 'Clear all filters')}
                            </button>
                        </div>

                        <button
                            onClick={applyFilters}
                            className={`rounded-md px-5 py-1.5 text-sm font-medium transition-colors ${
                                hasChanges
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    : 'border-input bg-background text-muted-foreground cursor-default border'
                            }`}
                            disabled={!hasChanges}
                        >
                            {t('shop.apply_filters', 'Apply filters')}
                            {hasChanges && (
                                <span className="bg-primary-foreground/20 ml-2 inline-block h-2 w-2 rounded-full" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Product list */}
            {isLoading ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="border-border bg-card overflow-hidden rounded-xl border"
                            >
                                <div className="bg-muted aspect-square animate-pulse" />
                                <div className="space-y-2 p-4">
                                    <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
                                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                                    <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
                                    <div className="bg-muted mt-3 h-9 animate-pulse rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="border-border bg-card flex gap-4 rounded-xl border p-4 sm:gap-6"
                            >
                                <div className="bg-muted h-32 w-32 shrink-0 animate-pulse rounded-lg sm:h-40 sm:w-40" />
                                <div className="flex flex-1 flex-col gap-3 py-1">
                                    <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                                    <div className="bg-muted h-5 w-2/3 animate-pulse rounded" />
                                    <div className="bg-muted h-5 w-1/4 animate-pulse rounded" />
                                    <div className="flex gap-2">
                                        <div className="bg-muted h-6 w-20 animate-pulse rounded-md" />
                                        <div className="bg-muted h-6 w-20 animate-pulse rounded-md" />
                                    </div>
                                    <div className="mt-auto flex gap-2">
                                        <div className="bg-muted h-8 w-28 animate-pulse rounded-lg" />
                                        <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : data?.data?.length === 0 ? (
                <div className="text-muted-foreground py-24 text-center">
                    {t('shop.no_products', 'No products found.')}{' '}
                    <button onClick={clearFilters} className="underline">
                        {t('shop.clear_filters_link', 'Clear filters')}
                    </button>
                </div>
            ) : (
                <>
                    <div
                        className="transition-opacity duration-200"
                        style={{ opacity: isFetching ? 0.4 : 1 }}
                    >
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {data?.data?.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {data?.data?.map((product) => (
                                    <ProductListItem
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {data?.meta && data.meta.last_page > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            setParam(
                                                'page',
                                                String(
                                                    data.meta!.current_page - 1,
                                                ),
                                            )
                                        }
                                        disabled={data.meta.current_page <= 1}
                                    />
                                </PaginationItem>

                                {buildPaginationItems(
                                    data.meta.current_page,
                                    data.meta.last_page,
                                ).map((item, index) =>
                                    item === 'ellipsis' ? (
                                        <PaginationItem
                                            key={`ellipsis-${index}`}
                                        >
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={item}>
                                            <PaginationLink
                                                isActive={
                                                    item ===
                                                    data.meta!.current_page
                                                }
                                                onClick={() =>
                                                    setParam(
                                                        'page',
                                                        String(item),
                                                    )
                                                }
                                                aria-label={t(
                                                    'shop.go_to_page',
                                                    `Go to page ${item}`,
                                                )}
                                            >
                                                {item}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            setParam(
                                                'page',
                                                String(
                                                    data.meta!.current_page + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            data.meta.current_page >=
                                            data.meta.last_page
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
            <BackToTop />
        </div>
    );
}
