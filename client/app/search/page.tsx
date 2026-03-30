'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ProductFilters } from '@/api/products';
import { ProductCard } from '@/components/product-card';
import { useBrands, useCategories } from '@/hooks/use-cms';
import { useLocalePath } from '@/hooks/use-locale';
import { useProducts } from '@/hooks/use-products';
import { useTranslation } from '@/hooks/use-translation';
import { trackSearch } from '@/lib/datalayer';
import type { Brand } from '@/types/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const q = searchParams.get('q') ?? '';
  const filters: ProductFilters = {
    search: q || undefined,
    category: searchParams.get('category') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    page: Number(searchParams.get('page') ?? 1),
  };

  const lp = useLocalePath();
  const { t } = useTranslation();
  const { data, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const SORT_OPTIONS = [
    { value: '', label: t('shop.sort_default', 'Default') },
    { value: 'price', label: t('shop.sort_price_asc', 'Price: Low to High') },
    { value: '-price', label: t('shop.sort_price_desc', 'Price: High to Low') },
    { value: '-created_at', label: t('shop.sort_newest', 'Newest') },
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
    router.push(q ? lp(`/search?q=${encodeURIComponent(q)}`) : lp('/search'));
  }

  // Active filter chips (excluding q and page)
  const activeFilters: { key: string; label: string }[] = [];
  if (filters.category) {
    const cat = categories?.find((c) => c.slug === filters.category);
    activeFilters.push({ key: 'category', label: cat?.name ?? filters.category });
  }
  if (filters.brand) {
    const brand = brands?.find((b: Brand) => String(b.id) === filters.brand);
    activeFilters.push({ key: 'brand', label: brand?.name ?? `Brand #${filters.brand}` });
  }
  if (filters.min_price != null)
    activeFilters.push({ key: 'min_price', label: `From $${filters.min_price}` });
  if (filters.max_price != null)
    activeFilters.push({ key: 'max_price', label: `To $${filters.max_price}` });
  if (filters.sort) {
    const opt = SORT_OPTIONS.find((o) => o.value === filters.sort);
    activeFilters.push({ key: 'sort', label: opt?.label ?? filters.sort });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
            setParam('q', input);
          }}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              name="q"
              defaultValue={q}
              placeholder={t('shop.search_placeholder', 'Search products…')}
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
          <select
            value={filters.sort ?? ''}
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
            className="border-input bg-background hover:bg-accent inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('shop.filters', 'Filters')}
            {activeFilters.length > 0 && (
              <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">{t('search.active_filters', 'Active:')}</span>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setParam(f.key, '')}
              className="border-border bg-accent hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
            >
              {f.label}
              <X className="h-3 w-3" />
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
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} w-64 shrink-0 lg:block`}>
          <div className="border-border bg-card space-y-6 rounded-xl border p-4">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                  {t('search.categories', 'Categories')}
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setParam('category', '')}
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                      !filters.category
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {t('search.all_categories', 'All categories')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setParam('category', cat.slug)}
                      className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                        filters.category === cat.slug
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {brands && brands.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                  {t('search.brands', 'Brand')}
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setParam('brand', '')}
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                      !filters.brand
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {t('search.all_brands', 'All brands')}
                  </button>
                  {brands.map((brand: Brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setParam('brand', String(brand.id))}
                      className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                        filters.brand === String(brand.id)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                {t('search.price_range', 'Price range')}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  defaultValue={filters.min_price ?? ''}
                  onBlur={(e) => setParam('min_price', e.target.value)}
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  defaultValue={filters.max_price ?? ''}
                  onBlur={(e) => setParam('max_price', e.target.value)}
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {/* Result count */}
          <p className="text-muted-foreground mb-4 text-sm">
            {isLoading ? (
              t('search.searching', 'Searching…')
            ) : (
              <>
                <span className="text-foreground font-medium">
                  {data?.meta?.total ?? data?.data?.length ?? 0}
                </span>{' '}
                {q
                  ? t('search.results_for', `results for "${q}"`, { q })
                  : t('search.products_found', 'products found')}
              </>
            )}
          </p>

          {/* Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-border bg-card overflow-hidden rounded-xl border">
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
          {!isLoading && data?.data?.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-foreground text-lg font-medium">{t('search.no_results', 'No results found')}</p>
              {q && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('search.try_different', 'Try a different search or remove filters')}
                </p>
              )}
              {activeFilters.length > 0 && (
                <button onClick={clearAll} className="text-primary mt-4 text-sm underline">
                  {t('shop.clear_filters', 'Clear all filters')}
                </button>
              )}
              {/* Suggested categories */}
              {categories && categories.length > 0 && (
                <div className="mt-8">
                  <p className="text-muted-foreground mb-3 text-sm font-medium">
                    {t('search.browse_categories', 'Browse categories')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setParam('category', cat.slug)}
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
          {!isLoading && data && data.data.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data.meta && data.meta.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setParam('page', String(page))}
                      className={`h-9 w-9 rounded-md text-sm font-medium ${
                        page === data.meta!.current_page
                          ? 'bg-primary text-primary-foreground'
                          : 'border-input hover:bg-accent border'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
