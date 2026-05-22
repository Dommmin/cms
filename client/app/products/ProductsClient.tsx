'use client';

import {
    LayoutGrid,
    LayoutList,
    PackageOpen,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
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
import type {
    ActiveFilterChip,
    PendingFilters,
    ViewMode,
} from './ProductsClient.types';

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

    function removeFilterParam(key: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        params.delete('page');
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

    const activeFilterChips: ActiveFilterChip[] = [];
    const activeBrand = searchParams.get('brand');

    if (activeBrand) {
        const brandLabel =
            availableFilters?.brands.find(
                (brand) => String(brand.id) === activeBrand,
            )?.label ?? t('shop.brand', 'Brand');
        activeFilterChips.push({
            key: 'brand',
            label: brandLabel,
            onRemove: () => removeFilterParam('brand'),
        });
    }

    if (searchParams.get('min_price')) {
        activeFilterChips.push({
            key: 'min_price',
            label: `${t('shop.min_price', 'Min Price')}: ${searchParams.get('min_price')}`,
            onRemove: () => removeFilterParam('min_price'),
        });
    }

    if (searchParams.get('max_price')) {
        activeFilterChips.push({
            key: 'max_price',
            label: `${t('shop.max_price', 'Max Price')}: ${searchParams.get('max_price')}`,
            onRemove: () => removeFilterParam('max_price'),
        });
    }

    if (searchParams.get('in_stock') === '1') {
        activeFilterChips.push({
            key: 'in_stock',
            label: t('shop.in_stock_only', 'In stock only'),
            onRemove: () => removeFilterParam('in_stock'),
        });
    }

    Object.entries(appliedFilters.attributes ?? {}).forEach(
        ([attributeSlug, values]) => {
            values.forEach((valueSlug) => {
                const attribute = availableFilters?.attributes.find(
                    (item) => item.slug === attributeSlug,
                );
                const value = attribute?.values.find(
                    (item) => item.slug === valueSlug,
                );
                activeFilterChips.push({
                    key: `attr_${attributeSlug}_${valueSlug}`,
                    label: `${attribute?.label ?? attributeSlug}: ${value?.label ?? valueSlug}`,
                    onRemove: () => {
                        const params = new URLSearchParams(
                            searchParams.toString(),
                        );
                        const nextValues = values.filter(
                            (item) => item !== valueSlug,
                        );
                        if (nextValues.length > 0) {
                            params.set(
                                `attr_${attributeSlug}`,
                                nextValues.join(','),
                            );
                        } else {
                            params.delete(`attr_${attributeSlug}`);
                        }
                        params.delete('page');
                        router.push(lp(`/products?${params.toString()}`));
                    },
                });
            });
        },
    );

    const activeFilterCount = activeFilterChips.length;

    const renderFiltersPanel = (idPrefix: string) => (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold">
                        {t('shop.filters', 'Filters')}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {t(
                            'shop.filters_hint',
                            'Refine the product selection.',
                        )}
                    </p>
                </div>
                {activeFilterCount > 0 && (
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                        {activeFilterCount}
                    </span>
                )}
            </div>

            {availableFilters && (
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor={`${idPrefix}-brand`}
                            className="text-muted-foreground mb-1.5 block text-xs font-medium"
                        >
                            {t('shop.brand', 'Brand')}
                        </label>
                        <select
                            id={`${idPrefix}-brand`}
                            value={pending.brand}
                            onChange={(e) =>
                                setPending((prev) => ({
                                    ...prev,
                                    brand: e.target.value,
                                }))
                            }
                            className="border-input bg-background focus:ring-ring min-h-11 w-full rounded-[var(--store-control-radius)] border px-3 text-sm focus:ring-2 focus:outline-none"
                        >
                            <option value="">
                                {t('shop.all_brands', 'All brands')}
                            </option>
                            {availableFilters.brands.map((brand) => (
                                <option key={brand.id} value={String(brand.id)}>
                                    {brand.label} ({brand.count})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor={`${idPrefix}-min-price`}
                                className="text-muted-foreground mb-1.5 block text-xs font-medium"
                            >
                                {t('shop.min_price', 'Min Price')} (€)
                            </label>
                            <input
                                id={`${idPrefix}-min-price`}
                                type="number"
                                value={pending.min_price}
                                onChange={(e) =>
                                    setPending((prev) => ({
                                        ...prev,
                                        min_price: e.target.value,
                                    }))
                                }
                                className="border-input bg-background focus:ring-ring min-h-11 w-full rounded-[var(--store-control-radius)] border px-3 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={`${idPrefix}-max-price`}
                                className="text-muted-foreground mb-1.5 block text-xs font-medium"
                            >
                                {t('shop.max_price', 'Max Price')} (€)
                            </label>
                            <input
                                id={`${idPrefix}-max-price`}
                                type="number"
                                value={pending.max_price}
                                onChange={(e) =>
                                    setPending((prev) => ({
                                        ...prev,
                                        max_price: e.target.value,
                                    }))
                                }
                                className="border-input bg-background focus:ring-ring min-h-11 w-full rounded-[var(--store-control-radius)] border px-3 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {availableFilters && availableFilters.attributes.length > 0 && (
                <div className="space-y-5 border-t pt-5">
                    {availableFilters.attributes.map((attribute) => (
                        <div key={attribute.slug}>
                            <p className="text-muted-foreground mb-2 text-xs font-medium">
                                {attribute.label}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {attribute.values.map((value) => {
                                    const isSelected =
                                        pending.attributes[
                                            attribute.slug
                                        ]?.includes(value.slug) ?? false;

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
                                            className={`min-h-9 rounded-full border px-3 text-sm transition-colors ${
                                                isSelected
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-input bg-background hover:bg-accent'
                                            }`}
                                        >
                                            {value.label} ({value.count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-4 border-t pt-5">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
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

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={clearFilters}
                        className="border-input bg-background hover:bg-accent min-h-11 rounded-[var(--store-control-radius)] border px-3 text-sm"
                    >
                        {t('shop.clear_filters', 'Clear all filters')}
                    </button>
                    <button
                        onClick={() => {
                            applyFilters();
                            setShowFilters(false);
                        }}
                        className={`min-h-11 rounded-[var(--store-control-radius)] px-4 text-sm font-medium transition-colors ${
                            hasChanges
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'border-input bg-background text-muted-foreground cursor-default border'
                        }`}
                        disabled={!hasChanges}
                    >
                        {t('shop.apply_filters', 'Apply filters')}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="store-shell mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {appliedFilters.category && (
                <CategoryBanner slug={appliedFilters.category} />
            )}
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                        {t('shop.collection_label', 'Collection')}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                        {t('shop.title', 'Shop')}
                    </h1>
                    {data && (
                        <p className="text-muted-foreground mt-2 text-sm">
                            {data.meta?.total ?? data.data?.length ?? 0}{' '}
                            {t('shop.products_suffix', 'products')}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label htmlFor="products-search" className="sr-only">
                        {t('shop.search_placeholder', 'Search products…')}
                    </label>
                    <div className="relative">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
                            className="border-input bg-background focus:ring-ring min-h-11 w-full rounded-[var(--store-control-radius)] border pr-3 pl-9 text-sm focus:ring-2 focus:outline-none sm:w-64"
                        />
                    </div>

                    <label htmlFor="products-sort" className="sr-only">
                        {t('shop.sort_label', 'Sort products')}
                    </label>
                    <select
                        id="products-sort"
                        value={appliedFilters.sort ?? ''}
                        onChange={(e) => setParam('sort', e.target.value)}
                        className="border-input bg-background focus:ring-ring min-h-11 rounded-[var(--store-control-radius)] border px-3 text-sm focus:ring-2 focus:outline-none"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>

                    <div
                        role="group"
                        aria-label={t('shop.view_mode', 'View mode')}
                        className="border-input flex min-h-11 overflow-hidden rounded-[var(--store-control-radius)] border"
                    >
                        <button
                            onClick={() => changeViewMode('grid')}
                            aria-label={t('shop.view_grid', 'Grid view')}
                            aria-pressed={viewMode === 'grid'}
                            className={`inline-flex min-w-11 items-center justify-center transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-accent'
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => changeViewMode('list')}
                            aria-label={t('shop.view_list', 'List view')}
                            aria-pressed={viewMode === 'list'}
                            className={`border-input inline-flex min-w-11 items-center justify-center border-l transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-accent'
                            }`}
                        >
                            <LayoutList className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFilters(true)}
                        aria-expanded={showFilters}
                        aria-controls="products-filters-drawer"
                        className="border-input bg-background hover:bg-accent inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--store-control-radius)] border px-3 text-sm lg:hidden"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        {t('shop.filters', 'Filters')}
                        {activeFilterCount > 0 && (
                            <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeFilterChips.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {activeFilterChips.map((chip) => (
                        <button
                            key={chip.key}
                            type="button"
                            onClick={chip.onRemove}
                            className="border-input bg-background hover:bg-accent inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-sm"
                        >
                            {chip.label}
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground min-h-9 px-2 text-sm underline-offset-4 hover:underline"
                    >
                        {t('shop.clear_filters', 'Clear all filters')}
                    </button>
                </div>
            )}

            {showFilters && (
                <div
                    id="products-filters-drawer"
                    className="fixed inset-0 z-50 lg:hidden"
                    role="dialog"
                    aria-modal="true"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        aria-label={t('shop.close_filters', 'Close filters')}
                        onClick={() => setShowFilters(false)}
                    />
                    <div className="bg-card absolute right-0 bottom-0 left-0 max-h-[88vh] overflow-auto rounded-t-2xl border-t p-4 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-semibold">
                                {t('shop.filters', 'Filters')}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                className="hover:bg-accent flex h-10 w-10 items-center justify-center rounded-full"
                                aria-label={t(
                                    'shop.close_filters',
                                    'Close filters',
                                )}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {renderFiltersPanel('products-mobile-filters')}
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <aside className="hidden lg:block">
                    <div className="border-border bg-card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[var(--store-card-radius)] border p-4 shadow-[var(--store-shadow-soft)]">
                        {renderFiltersPanel('products-desktop-filters')}
                    </div>
                </aside>

                <div className="min-w-0">
                    {isLoading ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-[var(--store-grid-gap)] min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="border-border bg-card overflow-hidden rounded-[var(--store-card-radius)] border shadow-[var(--store-shadow-soft)]"
                                    >
                                        <div className="bg-muted/70 aspect-square animate-pulse sm:aspect-[var(--store-product-image-ratio)]" />
                                        <div className="space-y-2 p-4">
                                            <div className="bg-muted h-3 w-1/3 animate-pulse rounded-full" />
                                            <div className="bg-muted h-4 w-[88%] animate-pulse rounded" />
                                            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                                            <div className="bg-muted h-5 w-1/2 animate-pulse rounded" />
                                            <div className="bg-muted mt-4 h-11 animate-pulse rounded-[var(--store-control-radius)]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="border-border bg-card flex flex-col gap-4 rounded-[var(--store-card-radius)] border p-4 shadow-[var(--store-shadow-soft)] sm:flex-row sm:gap-6"
                                    >
                                        <div className="bg-muted aspect-[4/3] w-full shrink-0 animate-pulse rounded-md sm:h-40 sm:w-44" />
                                        <div className="flex flex-1 flex-col gap-3 py-1">
                                            <div className="bg-muted h-3 w-24 animate-pulse rounded-full" />
                                            <div className="bg-muted h-5 w-2/3 animate-pulse rounded" />
                                            <div className="bg-muted h-5 w-1/4 animate-pulse rounded" />
                                            <div className="flex flex-wrap gap-2">
                                                <div className="bg-muted h-7 w-24 animate-pulse rounded-md" />
                                                <div className="bg-muted h-7 w-32 animate-pulse rounded-md" />
                                            </div>
                                            <div className="mt-auto flex gap-2">
                                                <div className="bg-muted h-10 w-32 animate-pulse rounded-[var(--store-control-radius)]" />
                                                <div className="bg-muted h-10 w-10 animate-pulse rounded-[var(--store-control-radius)]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : data?.data?.length === 0 ? (
                        <div className="border-border bg-card flex min-h-[24rem] flex-col items-center justify-center rounded-[var(--store-card-radius)] border px-6 text-center shadow-[var(--store-shadow-soft)]">
                            <PackageOpen className="text-muted-foreground h-10 w-10" />
                            <h2 className="mt-4 text-xl font-semibold">
                                {t('shop.no_products', 'No products found.')}
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                                {t(
                                    'shop.no_products_hint',
                                    'Try removing filters or searching for a broader term.',
                                )}
                            </p>
                            <button
                                onClick={clearFilters}
                                className="bg-primary text-primary-foreground mt-6 min-h-11 rounded-[var(--store-control-radius)] px-5 text-sm font-medium"
                            >
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
                                    <div className="grid grid-cols-1 gap-[var(--store-grid-gap)] min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        {data?.data?.map((product, index) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                priority={index < 4}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {data?.data?.map((product, index) => (
                                            <ProductListItem
                                                key={product.id}
                                                product={product}
                                                priority={index === 0}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {data?.meta && data.meta.last_page > 1 && (
                                <Pagination className="mt-8">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() =>
                                                    setParam(
                                                        'page',
                                                        String(
                                                            data.meta!
                                                                .current_page -
                                                                1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    data.meta.current_page <= 1
                                                }
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
                                                            data.meta!
                                                                .current_page
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
                                                            data.meta!
                                                                .current_page +
                                                                1,
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
                </div>
            </div>
            <BackToTop />
        </div>
    );
}
