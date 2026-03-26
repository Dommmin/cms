'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  clearComparison,
  removeFromCompare,
  useComparisonIds,
  useComparisonProducts,
} from '@/hooks/use-comparison';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

export function ComparisonBar() {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const ids = useComparisonIds();
  const { data: products = [] } = useComparisonProducts();

  if (ids.length === 0) return null;

  return (
    <div className="border-border bg-background/95 fixed right-0 bottom-0 left-0 z-40 border-t shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <span className="text-muted-foreground shrink-0 text-sm font-medium">
          {t('compare.title', 'Compare')} ({ids.length})
        </span>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-border bg-card flex items-center gap-1.5 rounded-lg border px-2 py-1"
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
            className="text-muted-foreground hover:text-foreground text-xs underline"
          >
            {t('compare.clear', 'Clear')}
          </button>
          <Link
            href={lp('/compare')}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90"
          >
            {t('compare.view', 'Compare ({n})').replace('{n}', String(ids.length))}
          </Link>
        </div>
      </div>
    </div>
  );
}
