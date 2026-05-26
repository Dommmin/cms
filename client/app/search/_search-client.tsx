'use client';

import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { searchProducts } from '@/api/search';
import type { SearchFilters, SearchResult } from '@/api/search.types';
import { useBrands, useCategories } from '@/hooks/use-cms';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { trackSearch } from '@/lib/datalayer';
import { formatPrice } from '@/lib/format';
import type { Brand, Category } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

function ProductSearchCard({
    product,
}: {
    product: SearchResult['data'][number];
}) {
    return (
        <article className="border-border bg-card overflow-hidden rounded-xl border">
            <div className="bg-muted aspect-square">
                {product.thumbnail && (
                    <img
                        src={
                            product.thumbnail.thumb_url || product.thumbnail.url
                        }
                        alt={product.thumbnail.alt || product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                )}
            </div>
            <div className="space-y-1 p-3">
                <p className="text-muted-foreground text-xs">
                    {product.category?.name}
                </p>
                <h3 className="text-foreground text-sm leading-tight font-medium">
                    {product.name}
                </h3>
                <p className="text-foreground text-base font-bold">
                    {formatPrice(product.price_min)}
                    {product.price_max > product.price_min && (
                        <span className="text-muted-foreground text-sm font-normal">
                            {' '}
                            – {formatPrice(product.price_max)}
                        </span>
                    )}
                </p>
            </div>
        </article>
    );
}

const VISIBLE_DEFAULT = 5;

export function SearchClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedFilters, setExpandedFilters] = useState<
        Record<string, boolean>
    >({});

    const q = searchParams.get('q') ?? '';
    const category = searchParams.get('category') ?? undefined;
    const brand = searchParams.get('brand') ?? undefined;
    const sortParam = searchParams.get('sort') ?? undefined;
    const minPrice = searchParams.get('min_price')
        ? Number(searchParams.get('min_price'))
        : undefined;
    const maxPrice = searchParams.get('max_price')
        ? Number(searchParams.get('max_price'))
        : undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const filters: SearchFilters = {
        q: q || undefined,
        category,
        brand,
        sort: sortParam,
        min_price: minPrice,
        max_price: maxPrice,
        page,
        per_page: 20,
    };

    const { data, isLoading } = useQuery({
        queryKey: ['search', filters],
        queryFn: () => searchProducts(filters),
        enabled: !!q || !!category || !!brand,
    });

    const { data: categories } = useCategories();
    const { data: brands } = useBrands();

    const lp = useLocalePath();
    const { t } = useTranslation();

    function toggleFilter(key: string) {
        setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    const SORT_OPTIONS = [
        { value: '', label: t('shop.sort_default', 'Default') },
        {
            value: 'price:asc',
            label: t('shop.sort_price_asc', 'Price: Low to High'),
        },
        {
            value: 'price:desc',
            label: t('shop.sort_price_desc', 'Price: High to Low'),
        },
        { value: 'created_at:desc', label: t('shop.sort_newest', 'Newest') },
    ];

    useEffect(() => {
        if (q) {
            trackSearch(q);
        }
    }, [q]);

    function setParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== 'page') params.delete('page');
        router.push(lp(`/search?${params.toString()}`));
        if (key === 'page') window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearAll() {
        router.push(
            q ? lp(`/search?q=${encodeURIComponent(q)}`) : lp('/search'),
        );
    }

    const facets = data?.meta?.facets;
    const products = data?.data ?? [];
    const meta = data?.meta;

    const activeFilters: { key: string; label: string }[] = [];
    if (category) {
        const cat = categories?.find(
            (c: Category) => c.slug === category || String(c.id) === category,
        );
        activeFilters.push({
            key: 'category',
            label: cat?.name ?? category,
        });
    }
    if (brand) {
        const br = brands?.find((b: Brand) => String(b.id) === brand);
        activeFilters.push({
            key: 'brand',
            label: br?.name ?? `Brand #${brand}`,
        });
    }
    if (minPrice != null)
        activeFilters.push({
            key: 'min_price',
            label: `From ${formatPrice(minPrice)}`,
        });
    if (maxPrice != null)
        activeFilters.push({
            key: 'max_price',
            label: `To ${formatPrice(maxPrice)}`,
        });
    if (sortParam) {
        const opt = SORT_OPTIONS.find((o) => o.value === sortParam);
        activeFilters.push({ key: 'sort', label: opt?.label ?? sortParam });
    }

    const priceRanges = facets?.price_ranges ?? {
        min: 0,
        max: 0,
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Top bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const input = (
                            e.currentTarget.elements.namedItem(
                                'q',
                            ) as HTMLInputElement
                        ).value;
                        setParam('q', input);
                    }}
                    role="search"
                    className="flex flex-1 items-center gap-2"
                >
                    <div className="relative flex-1">
                        <Search
                            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <label htmlFor="search-page-input" className="sr-only">
                            {t('shop.search_label', 'Search products')}
                        </label>
                        <input
                            id="search-page-input"
                            name="q"
                            defaultValue={q}
                            placeholder={t(
                                'shop.search_placeholder',
                                'Search products…',
                            )}
                            className="border-input bg-background focus:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-9 text-sm focus:ring-2 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium hover:opacity-90"
                    >
                        {t('search.button', 'Search')}
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <label htmlFor="search-sort" className="sr-only">
                        {t('shop.sort_label', 'Sort by')}
                    </label>
                    <select
                        id="search-sort"
                        value={sortParam ?? ''}
                        onChange={(e) => setParam('sort', e.target.value)}
                        className="border-input bg-background focus:ring-ring rounded-xl border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        aria-expanded={sidebarOpen}
                        aria-controls="search-filters-sidebar"
                        className="border-input bg-background hover:bg-accent inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm lg:hidden"
                    >
                        <SlidersHorizontal
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                        {t('shop.filters', 'Filters')}
                        {activeFilters.length > 0 && (
                            <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Did you mean? */}
            {meta?.did_you_mean && (
                <p className="text-muted-foreground mb-4 text-sm">
                    {t('search.did_you_mean', 'Did you mean')}{' '}
                    <button
                        onClick={() => setParam('q', meta.did_you_mean!)}
                        className="text-primary underline"
                    >
                        {meta.did_you_mean}
                    </button>
                    ?
                </p>
            )}

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                        {t('search.active_filters', 'Active:')}
                    </span>
                    {activeFilters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setParam(f.key, '')}
                            aria-label={t(
                                'search.remove_filter',
                                `Remove filter: ${f.label}`,
                            ).replace('{label}', f.label)}
                            className="border-border bg-accent hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                        >
                            {f.label}
                            <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                    ))}
                    <button
                        onClick={clearAll}
                        className="text-muted-foreground hover:text-foreground text-xs underline"
                    >
                        {t('shop.clear_filters_link', 'Clear all')}
                    </button>
                </div>
            )}

            <div className="flex gap-6">
                {/* Sidebar */}
                <aside
                    id="search-filters-sidebar"
                    aria-label={t('shop.filters_label', 'Search filters')}
                    className={`${sidebarOpen ? 'block' : 'hidden'} w-64 shrink-0 lg:block`}
                >
                    <div className="border-border bg-card space-y-6 rounded-xl border p-4">
                        {/* Categories from facets */}
                        {facets && facets.categories.length > 0 && (
                            <div>
                                <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                                    {t('search.categories', 'Categories')}
                                </p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setParam('category', '')}
                                        className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                                            !category
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                                        }`}
                                    >
                                        {t(
                                            'search.all_categories',
                                            'All categories',
                                        )}
                                    </button>
                                    {facets.categories
                                        .slice(
                                            0,
                                            expandedFilters['categories']
                                                ? undefined
                                                : VISIBLE_DEFAULT,
                                        )
                                        .map(
                                            (cat: {
                                                id: string;
                                                slug: string;
                                                name: string;
                                                count: number;
                                            }) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() =>
                                                        setParam(
                                                            'category',
                                                            cat.slug,
                                                        )
                                                    }
                                                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                                                        category === cat.slug ||
                                                        category === cat.id
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                                                    }`}
                                                >
                                                    {cat.name} ({cat.count})
                                                </button>
                                            ),
                                        )}
                                    {facets.categories.length >
                                        VISIBLE_DEFAULT && (
                                        <button
                                            onClick={() =>
                                                toggleFilter('categories')
                                            }
                                            className="text-muted-foreground hover:text-foreground mt-1 flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                                        >
                                            {expandedFilters['categories']
                                                ? t(
                                                      'search.show_less',
                                                      'Show less',
                                                  )
                                                : t(
                                                      'search.show_more',
                                                      'Show more',
                                                  )}
                                            <ChevronDown
                                                className={`h-3 w-3 transition-transform ${
                                                    expandedFilters[
                                                        'categories'
                                                    ]
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Brands from facets */}
                        {facets && facets.brands.length > 0 && (
                            <div>
                                <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                                    {t('search.brands', 'Brand')}
                                </p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setParam('brand', '')}
                                        className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                                            !brand
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                                        }`}
                                    >
                                        {t('search.all_brands', 'All brands')}
                                    </button>
                                    {facets.brands
                                        .slice(
                                            0,
                                            expandedFilters['brands']
                                                ? undefined
                                                : VISIBLE_DEFAULT,
                                        )
                                        .map(
                                            (br: {
                                                id: string;
                                                name: string;
                                                count: number;
                                            }) => (
                                                <button
                                                    key={br.id}
                                                    onClick={() =>
                                                        setParam('brand', br.id)
                                                    }
                                                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                                                        brand === br.id
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                                                    }`}
                                                >
                                                    {br.name} ({br.count})
                                                </button>
                                            ),
                                        )}
                                    {facets.brands.length > VISIBLE_DEFAULT && (
                                        <button
                                            onClick={() =>
                                                toggleFilter('brands')
                                            }
                                            className="text-muted-foreground hover:text-foreground mt-1 flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                                        >
                                            {expandedFilters['brands']
                                                ? t(
                                                      'search.show_less',
                                                      'Show less',
                                                  )
                                                : t(
                                                      'search.show_more',
                                                      'Show more',
                                                  )}
                                            <ChevronDown
                                                className={`h-3 w-3 transition-transform ${
                                                    expandedFilters['brands']
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Price range */}
                        <div>
                            <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                                {t('search.price_range', 'Price range')}
                            </p>
                            <p className="text-muted-foreground mb-2 text-xs">
                                {formatPrice(priceRanges.min)} –{' '}
                                {formatPrice(priceRanges.max)}
                            </p>
                            <div className="flex items-center gap-2">
                                <label htmlFor="price-min" className="sr-only">
                                    {t('search.price_min', 'Minimum price')}
                                </label>
                                <input
                                    id="price-min"
                                    type="number"
                                    min={0}
                                    placeholder="Min"
                                    defaultValue={minPrice ?? ''}
                                    onBlur={(e) =>
                                        setParam('min_price', e.target.value)
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none"
                                />
                                <span
                                    className="text-muted-foreground"
                                    aria-hidden="true"
                                >
                                    –
                                </span>
                                <label htmlFor="price-max" className="sr-only">
                                    {t('search.price_max', 'Maximum price')}
                                </label>
                                <input
                                    id="price-max"
                                    type="number"
                                    min={0}
                                    placeholder="Max"
                                    defaultValue={maxPrice ?? ''}
                                    onBlur={(e) =>
                                        setParam('max_price', e.target.value)
                                    }
                                    className="border-input bg-background focus:ring-ring w-full rounded-lg border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Results */}
                <div className="min-w-0 flex-1">
                    {/* Result count */}
                    <p
                        className="text-muted-foreground mb-4 text-sm"
                        aria-live="polite"
                        aria-atomic="true"
                        role="status"
                    >
                        {isLoading ? (
                            t('search.searching', 'Searching…')
                        ) : (
                            <>
                                <span className="text-foreground font-medium">
                                    {meta?.total ?? 0}
                                </span>{' '}
                                {q
                                    ? t(
                                          'search.results_for',
                                          `results for "${q}"`,
                                      ).replace('{q}', q)
                                    : t(
                                          'search.products_found',
                                          'products found',
                                      )}
                            </>
                        )}
                    </p>

                    {/* Skeleton */}
                    {isLoading && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="border-border bg-card overflow-hidden rounded-xl border"
                                >
                                    <div className="bg-muted aspect-square animate-pulse" />
                                    <div className="space-y-2 p-4">
                                        <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
                                        <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                                        <div className="bg-muted mt-2 h-8 animate-pulse rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && products.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-foreground text-lg font-medium">
                                {t('search.no_results', 'No results found')}
                            </p>
                            {q && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {t(
                                        'search.try_different',
                                        'Try a different search or remove filters',
                                    )}
                                </p>
                            )}
                            {activeFilters.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-primary mt-4 text-sm underline"
                                >
                                    {t(
                                        'shop.clear_filters',
                                        'Clear all filters',
                                    )}
                                </button>
                            )}
                            {/* Suggested categories */}
                            {categories && categories.length > 0 && (
                                <div className="mt-8">
                                    <p className="text-muted-foreground mb-3 text-sm font-medium">
                                        {t(
                                            'search.browse_categories',
                                            'Browse categories',
                                        )}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {categories.slice(0, 6).map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() =>
                                                    setParam(
                                                        'category',
                                                        cat.slug,
                                                    )
                                                }
                                                className="border-border hover:bg-accent rounded-full border px-3 py-1 text-sm"
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grid */}
                    {!isLoading && products.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {products.map((product) => (
                                    <a
                                        key={product.id}
                                        href={lp(`/products/${product.slug}`)}
                                        className="hover:bg-accent/5 rounded-xl transition-colors"
                                    >
                                        <ProductSearchCard product={product} />
                                    </a>
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta && meta.last_page > 1 && (
                                <nav
                                    aria-label={t(
                                        'search.pagination',
                                        'Pagination',
                                    )}
                                    className="mt-8 flex items-center justify-center gap-2"
                                >
                                    {Array.from(
                                        { length: meta.last_page },
                                        (_, i) => i + 1,
                                    ).map((p) => {
                                        const isCurrent =
                                            p === meta.current_page;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() =>
                                                    setParam('page', String(p))
                                                }
                                                aria-current={
                                                    isCurrent
                                                        ? 'page'
                                                        : undefined
                                                }
                                                aria-label={t(
                                                    'search.page_n',
                                                    `Page ${p}`,
                                                ).replace('{n}', String(p))}
                                                className={`h-9 w-9 rounded-md text-sm font-medium ${
                                                    isCurrent
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border-input hover:bg-accent border'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
