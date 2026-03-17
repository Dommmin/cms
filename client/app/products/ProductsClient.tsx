"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/hooks/use-products";
import { useLocalePath } from "@/hooks/use-locale";
import { useTranslation } from "@/hooks/use-translation";
import type { ProductFilters } from "@/api/products";

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lp = useLocalePath();
  const { t } = useTranslation();

  const SORT_OPTIONS = [
    { value: "", label: t("shop.sort_default", "Default") },
    { value: "price", label: t("shop.sort_price_asc", "Price: Low to High") },
    { value: "-price", label: t("shop.sort_price_desc", "Price: High to Low") },
    { value: "-created_at", label: t("shop.sort_newest", "Newest") },
  ];

  const [showFilters, setShowFilters] = useState(false);

  const filters: ProductFilters = {
    page: Number(searchParams.get("page") ?? 1),
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
  };

  const { data, isLoading } = useProducts(filters);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(lp(`/products?${params.toString()}`));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("shop.title", "Shop")}</h1>
          {data && (
            <p className="mt-1 text-sm text-muted-foreground">
              {data.meta?.total ?? data.data?.length ?? 0} {t("shop.products_suffix", "products")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="search"
            placeholder={t("shop.search_placeholder", "Search products…")}
            defaultValue={filters.search ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setParam("search", (e.target as HTMLInputElement).value);
              }
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {/* Sort */}
          <select
            value={filters.sort ?? ""}
            onChange={(e) => setParam("sort", e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("shop.filters", "Filters")}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("shop.min_price", "Min Price")} (€)
            </label>
            <input
              type="number"
              defaultValue={filters.min_price ?? ""}
              onBlur={(e) => setParam("min_price", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("shop.max_price", "Max Price")} (€)
            </label>
            <input
              type="number"
              defaultValue={filters.max_price ?? ""}
              onBlur={(e) => setParam("max_price", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="col-span-2 flex items-end">
            <button
              onClick={() => router.push(lp("/products"))}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
            >
              {t("shop.clear_filters", "Clear all filters")}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          {t("shop.no_products", "No products found.")}{" "}
          <button onClick={() => router.push(lp("/products"))} className="underline">
            {t("shop.clear_filters_link", "Clear filters")}
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
  );
}
