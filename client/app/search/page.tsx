"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { useBrands, useCategories } from "@/hooks/use-cms";
import { useProducts } from "@/hooks/use-products";
import { trackSearch } from "@/lib/datalayer";
import type { ProductFilters } from "@/api/products";
import type { Brand } from "@/types/api";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-created_at", label: "Newest" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const q = searchParams.get("q") ?? "";
  const filters: ProductFilters = {
    search: q || undefined,
    category: searchParams.get("category") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    page: Number(searchParams.get("page") ?? 1),
  };

  const { data, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

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
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  }

  function clearAll() {
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  // Active filter chips (excluding q and page)
  const activeFilters: { key: string; label: string }[] = [];
  if (filters.category) {
    const cat = categories?.find((c) => c.slug === filters.category);
    activeFilters.push({ key: "category", label: cat?.name ?? filters.category });
  }
  if (filters.brand) {
    const brand = brands?.find((b: Brand) => String(b.id) === filters.brand);
    activeFilters.push({ key: "brand", label: brand?.name ?? `Brand #${filters.brand}` });
  }
  if (filters.min_price != null)
    activeFilters.push({ key: "min_price", label: `From $${filters.min_price}` });
  if (filters.max_price != null)
    activeFilters.push({ key: "max_price", label: `To $${filters.max_price}` });
  if (filters.sort) {
    const opt = SORT_OPTIONS.find((o) => o.value === filters.sort);
    activeFilters.push({ key: "sort", label: opt?.label ?? filters.sort });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
            setParam("q", input);
          }}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={filters.sort ?? ""}
            onChange={(e) => setParam("sort", e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm hover:bg-accent lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active:</span>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setParam(f.key, "")}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
            >
              {f.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} w-64 shrink-0 lg:block`}
        >
          <div className="space-y-6 rounded-xl border border-border bg-card p-4">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categories
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setParam("category", "")}
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                      !filters.category
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setParam("category", cat.slug)}
                      className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                        filters.category === cat.slug
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
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
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Brand
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setParam("brand", "")}
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                      !filters.brand
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    All brands
                  </button>
                  {brands.map((brand: Brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setParam("brand", String(brand.id))}
                      className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                        filters.brand === String(brand.id)
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
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
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Price range
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  defaultValue={filters.min_price ?? ""}
                  onBlur={(e) => setParam("min_price", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  defaultValue={filters.max_price ?? ""}
                  onBlur={(e) => setParam("max_price", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Result count */}
          <p className="mb-4 text-sm text-muted-foreground">
            {isLoading ? (
              "Searching…"
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {data?.meta?.total ?? data?.data?.length ?? 0}
                </span>{" "}
                {q ? <>results for &ldquo;{q}&rdquo;</> : "products found"}
              </>
            )}
          </p>

          {/* Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && data?.data?.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-foreground">No results found</p>
              {q && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or remove filters
                </p>
              )}
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAll}
                  className="mt-4 text-sm text-primary underline"
                >
                  Clear all filters
                </button>
              )}
              {/* Suggested categories */}
              {categories && categories.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">Browse categories</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setParam("category", cat.slug)}
                        className="rounded-full border border-border px-3 py-1 text-sm hover:bg-accent"
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
                      onClick={() => setParam("page", String(page))}
                      className={`h-9 w-9 rounded-md text-sm font-medium ${
                        page === data.meta!.current_page
                          ? "bg-primary text-primary-foreground"
                          : "border border-input hover:bg-accent"
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
