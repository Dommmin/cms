'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { ProductFilters } from '@/api/products';
import { BackToTop } from '@/components/back-to-top';
import { ProductCard } from '@/components/product-card';
import { useLocalePath } from '@/hooks/use-locale';
import { useProducts } from '@/hooks/use-products';
import { useTranslation } from '@/hooks/use-translation';

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lp = useLocalePath();
  const { t } = useTranslation();

  const SORT_OPTIONS = [
    { value: '', label: t('shop.sort_default', 'Default') },
    { value: 'price', label: t('shop.sort_price_asc', 'Price: Low to High') },
    { value: '-price', label: t('shop.sort_price_desc', 'Price: High to Low') },
    { value: '-created_at', label: t('shop.sort_newest', 'Newest') },
    { value: '-rating', label: t('shop.sort_rating', 'Top Rated') },
  ];

  const [showFilters, setShowFilters] = useState(false);

  const filters: ProductFilters = {
    page: Number(searchParams.get('page') ?? 1),
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    in_stock: searchParams.get('in_stock') === '1' ? true : undefined,
  };

  const { data, isLoading } = useProducts(filters);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    router.push(lp(`/products?${params.toString()}`));
    if (key === 'page') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('shop.title', 'Shop')}</h1>
          {data && (
            <p className="text-muted-foreground mt-1 text-sm">
              {data.meta?.total ?? data.data?.length ?? 0} {t('shop.products_suffix', 'products')}
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
            placeholder={t('shop.search_placeholder', 'Search products…')}
            defaultValue={filters.search ?? ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setParam('search', (e.target as HTMLInputElement).value);
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
            value={filters.sort ?? ''}
            onChange={(e) => setParam('sort', e.target.value)}
            className="border-input bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="products-filters-panel"
            className="border-input bg-background hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {t('shop.filters', 'Filters')}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div
          id="products-filters-panel"
          className="border-border bg-card mb-6 grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4"
        >
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              {t('shop.min_price', 'Min Price')} (€)
            </label>
            <input
              type="number"
              defaultValue={filters.min_price ?? ''}
              onBlur={(e) => setParam('min_price', e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              {t('shop.max_price', 'Max Price')} (€)
            </label>
            <input
              type="number"
              defaultValue={filters.max_price ?? ''}
              onBlur={(e) => setParam('max_price', e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="col-span-2 flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!filters.in_stock}
                onChange={(e) => setParam('in_stock', e.target.checked ? '1' : '')}
                className="accent-primary h-4 w-4 rounded"
              />
              {t('shop.in_stock_only', 'In stock only')}
            </label>
            <button
              onClick={() => router.push(lp('/products'))}
              className="border-input bg-background hover:bg-accent rounded-md border px-3 py-1.5 text-sm"
            >
              {t('shop.clear_filters', 'Clear all filters')}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-border bg-card overflow-hidden rounded-xl border">
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
      ) : data?.data?.length === 0 ? (
        <div className="text-muted-foreground py-24 text-center">
          {t('shop.no_products', 'No products found.')}{' '}
          <button onClick={() => router.push(lp('/products'))} className="underline">
            {t('shop.clear_filters_link', 'Clear filters')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data?.data?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.last_page > 1 && (
            <nav
              aria-label={t('shop.pagination', 'Pagination')}
              className="mt-8 flex items-center justify-center gap-2"
            >
              {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setParam('page', String(page))}
                  aria-label={t('shop.go_to_page', `Go to page ${page}`)}
                  aria-current={page === data.meta!.current_page ? 'page' : undefined}
                  className={`h-9 w-9 rounded-md text-sm font-medium ${
                    page === data.meta!.current_page
                      ? 'bg-primary text-primary-foreground'
                      : 'border-input hover:bg-accent border'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
      <BackToTop />
    </div>
  );
}
