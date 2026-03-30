'use client';

import { ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { PriceDisplay } from '@/components/price-display';
import { useAddToCart } from '@/hooks/use-cart';
import {
  clearComparison,
  removeFromCompare,
  useComparisonIds,
  useComparisonProducts,
} from '@/hooks/use-comparison';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import type { Product } from '@/types/api';

export default function ComparePage() {
  const { t } = useTranslation();
  const lp = useLocalePath();
  // Hydration guard: localStorage is not available on the server, so we defer
  // all comparison state reads to after mount to avoid SSR/client mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const ids = useComparisonIds();
  const { data, isLoading } = useComparisonProducts();
  const { mutate: addToCart } = useAddToCart();

  const products: Product[] = data?.products ?? [];
  const sharedAttributeKeys: string[] = data?.sharedAttributeKeys ?? [];

  // Before mount, render a neutral skeleton (matches SSR output)
  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-2xl font-bold">
          {t('compare.empty_title', 'No products to compare')}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t('compare.empty_desc', 'Add products to compare from the product listing.')}
        </p>
        <Link
          href={lp('/products')}
          className="bg-primary text-primary-foreground inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90"
        >
          {t('compare.browse', 'Browse products')}
        </Link>
      </div>
    );
  }

  if (ids.length === 1) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-2xl font-bold">
          {t('compare.one_title', 'Add one more product')}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t(
            'compare.one_desc',
            'You need at least 2 products to compare. Add another product from the listing.',
          )}
        </p>
        <Link
          href={lp('/products')}
          className="bg-primary text-primary-foreground inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90"
        >
          {t('compare.browse', 'Browse products')}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="bg-muted h-7 w-48 animate-pulse rounded" />
          <div className="bg-muted h-5 w-16 animate-pulse rounded" />
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `200px repeat(${ids.length}, 1fr)` }}
        >
          <div />
          {ids.map((id) => (
            <div key={id} className="bg-muted h-64 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Base rows always shown
  const baseRows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    {
      label: t('compare.price', 'Price'),
      render: (p) => (
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
      label: t('compare.brand', 'Brand'),
      render: (p) => p.brand?.name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      label: t('compare.category', 'Category'),
      render: (p) => p.category?.name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      label: t('compare.availability', 'Availability'),
      render: (p) =>
        p.is_active ? (
          <span className="font-medium text-green-600">{t('compare.in_stock', 'In stock')}</span>
        ) : (
          <span className="text-muted-foreground">{t('compare.unavailable', 'Unavailable')}</span>
        ),
    },
    {
      label: t('compare.description', 'Description'),
      render: (p) => (
        <span className="text-muted-foreground line-clamp-4 text-xs">
          {p.short_description ?? '—'}
        </span>
      ),
    },
  ];

  // Attribute rows — only keys shared across all compared products
  const attributeRows: { label: string; render: (p: Product) => React.ReactNode }[] =
    sharedAttributeKeys.map((key) => ({
      label: key,
      render: (p) => {
        const value = p.variants
          ?.flatMap((v) => Object.entries(v.attributes ?? {}))
          .find(([k]) => k === key)?.[1];
        return value ? <span>{value}</span> : <span className="text-muted-foreground">—</span>;
      },
    }));

  const rows = [...baseRows, ...attributeRows];

  const colStyle = { gridTemplateColumns: `200px repeat(${products.length}, 1fr)` };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('compare.title', 'Compare Products')}</h1>
        <button
          onClick={clearComparison}
          className="text-muted-foreground hover:text-foreground text-sm underline"
        >
          {t('compare.clear_all', 'Clear all')}
        </button>
      </div>

      {/* Mixed-type notice */}
      {products.length > 0 && new Set(products.map((p) => p.product_type_id)).size > 1 && (
        <p className="text-muted-foreground mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm dark:border-yellow-800 dark:bg-yellow-900/20">
          {t(
            'compare.mixed_types_notice',
            'Products are from different categories — only common attributes are shown.',
          )}
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="grid min-w-[600px]" style={colStyle}>
          {/* Empty top-left cell */}
          <div />

          {/* Product header cards */}
          {products.map((product) => (
            <div key={product.id} className="border-border border-b pr-4 pb-4">
              <div className="flex justify-end">
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={t('compare.remove', 'Remove from comparison')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="bg-muted relative mx-auto mb-3 aspect-square w-28 overflow-hidden rounded-lg">
                {product.thumbnail?.url ? (
                  <Image
                    src={product.thumbnail.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : null}
              </div>
              <Link
                href={lp(`/products/${product.slug}`)}
                className="hover:text-primary block text-center text-sm font-semibold hover:underline"
              >
                {product.name}
              </Link>
              <div className="mt-3">
                <button
                  onClick={() => {
                    const variant = product.variants?.[0];
                    if (variant) {
                      addToCart(
                        { variant_id: variant.id, quantity: 1 },
                        {
                          onSuccess: () =>
                            toast.success(t('product.added_to_cart', 'Added to cart!')),
                        },
                      );
                    }
                  }}
                  disabled={!product.is_active || !product.variants?.length}
                  className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {t('product.add_to_cart', 'Add to Cart')}
                </button>
              </div>
            </div>
          ))}

          {/* Attribute rows */}
          {rows.map((row) => (
            <>
              <div
                key={`label-${row.label}`}
                className="text-muted-foreground border-border border-b py-3 pr-4 text-xs font-semibold tracking-wide uppercase"
              >
                {row.label}
              </div>
              {products.map((product) => (
                <div
                  key={`${row.label}-${product.id}`}
                  className="border-border border-b py-3 pr-4 text-sm"
                >
                  {row.render(product)}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      {/* Add more products CTA */}
      {ids.length < 4 && (
        <div className="mt-8 text-center">
          <Link
            href={lp('/products')}
            className="border-input hover:bg-accent inline-flex items-center rounded-xl border px-5 py-2.5 text-sm font-medium"
          >
            {t('compare.add_more', '+ Add another product to compare')}
          </Link>
        </div>
      )}
    </div>
  );
}
