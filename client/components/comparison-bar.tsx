"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { clearComparison, removeFromCompare, useComparisonProducts } from "@/hooks/use-comparison";
import { useComparisonIds } from "@/hooks/use-comparison";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";

export function ComparisonBar() {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const ids = useComparisonIds();
  const { data: products = [] } = useComparisonProducts();

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <span className="shrink-0 text-sm font-medium text-muted-foreground">
          {t("compare.title", "Compare")} ({ids.length})
        </span>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1"
            >
              {product.thumbnail?.url && (
                <Image
                  src={product.thumbnail.url}
                  alt={product.name}
                  width={28}
                  height={28}
                  className="rounded object-cover"
                />
              )}
              <span className="max-w-24 truncate text-xs font-medium">{product.name}</span>
              <button
                onClick={() => removeFromCompare(product.id)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={clearComparison}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            {t("compare.clear", "Clear")}
          </button>
          <Link
            href={lp("/compare")}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("compare.view", "Compare ({n})").replace("{n}", String(ids.length))}
          </Link>
        </div>
      </div>
    </div>
  );
}
