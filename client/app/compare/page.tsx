'use client';

import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
import { toast } from 'react-toastify';

export default function ComparePage() {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const ids = useComparisonIds();
  const { data: products = [], isLoading } = useComparisonProducts();
  const { mutate: addToCart } = useAddToCart();

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
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${ids.length}, 1fr)` }}>
          {ids.map((id) => (
            <div key={id} className="bg-muted h-64 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const rows = [
    {
      label: t('compare.price', 'Price'),
      render: (p: (typeof products)[0]) => (
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
      render: (p: (typeof products)[0]) => p.brand?.name ?? '—',
    },
    {
      label: t('compare.category', 'Category'),
      render: (p: (typeof products)[0]) => p.category?.name ?? '—',
    },
    {
      label: t('compare.description', 'Description'),
      render: (p: (typeof products)[0]) => (
        <span className="text-muted-foreground line-clamp-4 text-xs">
          {p.short_description ?? '—'}
        </span>
      ),
    },
  ];

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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Product headers */}
          <thead>
            <tr>
              <th className="border-border text-muted-foreground w-32 border-b py-3 pr-4 text-left text-sm font-medium" />
              {products.map((product) => (
                <th key={product.id} className="border-border border-b px-4 py-3 text-left">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="text-muted-foreground hover:text-foreground self-end text-xs"
                    >
                      ✕
                    </button>
                    <div className="bg-muted relative mx-auto aspect-square w-32 overflow-hidden rounded-lg">
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
                      className="hover:text-primary text-sm font-semibold hover:underline"
                    >
                      {product.name}
                    </Link>
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
                      className="bg-primary text-primary-foreground flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {t('product.add_to_cart', 'Add to Cart')}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Attribute rows */}
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-border border-b">
                <td className="text-muted-foreground py-3 pr-4 text-xs font-semibold tracking-wide uppercase">
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
