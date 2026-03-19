"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { clearComparison, removeFromCompare, useComparisonIds, useComparisonProducts } from "@/hooks/use-comparison";
import { useAddToCart } from "@/hooks/use-cart";
import { useLocalePath } from "@/hooks/use-locale";
import { useTranslation } from "@/hooks/use-translation";
import { PriceDisplay } from "@/components/price-display";
import { toast } from "react-toastify";

export default function ComparePage() {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const ids = useComparisonIds();
  const { data: products = [], isLoading } = useComparisonProducts();
  const { mutate: addToCart } = useAddToCart();

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-2xl font-bold">{t("compare.empty_title", "No products to compare")}</h1>
        <p className="mb-6 text-muted-foreground">
          {t("compare.empty_desc", "Add products to compare from the product listing.")}
        </p>
        <Link
          href={lp("/products")}
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t("compare.browse", "Browse products")}
        </Link>
      </div>
    );
  }

  if (ids.length === 1) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-2xl font-bold">{t("compare.one_title", "Add one more product")}</h1>
        <p className="mb-6 text-muted-foreground">
          {t("compare.one_desc", "You need at least 2 products to compare. Add another product from the listing.")}
        </p>
        <Link
          href={lp("/products")}
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t("compare.browse", "Browse products")}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${ids.length}, 1fr)` }}>
          {ids.map((id) => (
            <div key={id} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const rows = [
    {
      label: t("compare.price", "Price"),
      render: (p: typeof products[0]) => (
        <PriceDisplay
          price={p.price_min}
          compareAtPrice={p.compare_at_price_min}
          omnibusPrice={p.omnibus_price_min}
          isOnSale={p.is_on_sale}
          size="base"
        />
      ),
    },
    {
      label: t("compare.brand", "Brand"),
      render: (p: typeof products[0]) => p.brand?.name ?? "—",
    },
    {
      label: t("compare.category", "Category"),
      render: (p: typeof products[0]) => p.category?.name ?? "—",
    },
    {
      label: t("compare.description", "Description"),
      render: (p: typeof products[0]) => (
        <span className="line-clamp-4 text-xs text-muted-foreground">
          {p.short_description ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("compare.title", "Compare Products")}</h1>
        <button
          onClick={clearComparison}
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          {t("compare.clear_all", "Clear all")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Product headers */}
          <thead>
            <tr>
              <th className="w-32 border-b border-border py-3 pr-4 text-left text-sm font-medium text-muted-foreground" />
              {products.map((product) => (
                <th key={product.id} className="border-b border-border px-4 py-3 text-left">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="self-end text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                    <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-lg bg-muted">
                      {product.thumbnail?.url ? (
                        <Image
                          src={product.thumbnail.url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      ) : null}
                    </div>
                    <Link
                      href={lp(`/products/${product.slug}`)}
                      className="text-sm font-semibold hover:text-primary hover:underline"
                    >
                      {product.name}
                    </Link>
                    <button
                      onClick={() => {
                        const variant = product.variants?.[0];
                        if (variant) {
                          addToCart(
                            { variant_id: variant.id, quantity: 1 },
                            { onSuccess: () => toast.success(t("product.added_to_cart", "Added to cart!")) },
                          );
                        }
                      }}
                      disabled={!product.is_active || !product.variants?.length}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {t("product.add_to_cart", "Add to Cart")}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Attribute rows */}
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border">
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-sm">
                    {row.render(product)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
