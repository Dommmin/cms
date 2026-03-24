"use client";

import { useRecentlyViewedProducts } from "@/hooks/use-recently-viewed";
import { ProductCard } from "@/components/product-card";
import { useTranslation } from "@/hooks/use-translation";
import type { RecentlyViewedProps } from './recently-viewed.types';

export function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useRecentlyViewedProducts(excludeId);

  if (isLoading || products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold">
        {t("product.recently_viewed", "Recently Viewed")}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
