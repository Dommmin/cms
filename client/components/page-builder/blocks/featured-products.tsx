import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getRelationsByKey } from "@/lib/format";
import type { PageBlock, Product } from "@/types/api";
import type { FeaturedProductsConfig, FeaturedProductsProps } from './featured-products.types';

export function FeaturedProductsBlock({ block }: FeaturedProductsProps) {
  const cfg = block.configuration as FeaturedProductsConfig;
  const columns = cfg.columns ?? 4;

  // Products are embedded in relations as resolved data
  const productRelations = getRelationsByKey(block.relations, "products");
  const products = productRelations
    .map((r) => r.data as Product | null)
    .filter((p): p is Product => p !== null)
    .sort((a, b) => {
      const ra = productRelations.find((r) => (r.data as unknown as Product)?.id === a.id);
      const rb = productRelations.find((r) => (r.data as unknown as Product)?.id === b.id);
      return (ra?.position ?? 0) - (rb?.position ?? 0);
    });

  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className="flex flex-col gap-8">
      {(cfg.title || cfg.subtitle) && (
        <div className="flex items-end justify-between gap-4">
          <div>
            {cfg.title && (
              <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>
            )}
            {cfg.subtitle && (
              <p className="mt-1 text-muted-foreground">{cfg.subtitle}</p>
            )}
          </div>
          {cfg.view_all_url && (
            <Link
              href={cfg.view_all_url}
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              {cfg.view_all_label ?? "View all →"}
            </Link>
          )}
        </div>
      )}

      {products.length > 0 ? (
        <div className={`grid gap-6 ${colClass}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No products to display.</p>
      )}
    </div>
  );
}
