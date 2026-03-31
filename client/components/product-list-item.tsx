'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { CompareButton } from '@/components/compare-button';
import { PriceDisplay } from '@/components/price-display';
import { useMe } from '@/hooks/use-auth';
import { useAddToCart } from '@/hooks/use-cart';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from '@/hooks/use-wishlist';
import type { ProductListItemProps } from './product-list-item.types';

export function ProductListItem({ product }: ProductListItemProps) {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const firstVariantId = product.variants?.[0]?.id ?? 0;
  const { data: user } = useMe();
  const { mutate: addToCart, isPending } = useAddToCart();
  const inWishlist = useIsInWishlist(firstVariantId);
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const attributeMap = product.attribute_map ?? {};
  const attributeEntries = Object.entries(attributeMap).slice(0, 6);

  function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = lp('/login');
      return;
    }
    if (inWishlist) {
      removeFromWishlist(firstVariantId);
    } else {
      addToWishlist(firstVariantId, {
        onSuccess: () => toast.success(t('wishlist.added', 'Added to wishlist')),
      });
    }
  }

  return (
    <div className="border-border bg-card flex gap-4 rounded-xl border p-4 transition-shadow hover:shadow-md sm:gap-6">
      {/* Thumbnail */}
      <Link
        href={lp(`/products/${product.slug}`)}
        className="bg-muted relative h-32 w-32 shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-40"
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.thumbnail?.url ? (
          <Image
            src={product.thumbnail.url}
            alt={product.thumbnail.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="160px"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            {t('product.no_image', 'No image')}
          </div>
        )}

        {/* Sale badge */}
        {product.is_on_sale && (
          <span className="bg-primary text-primary-foreground absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-semibold">
            {product.discount_percentage
              ? `-${product.discount_percentage}%`
              : t('product.sale', 'Sale')}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Brand + name row */}
        <div>
          {product.brand && (
            <p className="text-muted-foreground mb-0.5 text-xs font-medium tracking-wide uppercase">
              {product.brand.name}
            </p>
          )}
          <Link
            href={lp(`/products/${product.slug}`)}
            className="hover:text-primary text-base leading-snug font-semibold hover:underline"
          >
            {product.name}
          </Link>
        </div>

        {/* Price */}
        <PriceDisplay
          price={product.price_min}
          compareAtPrice={product.compare_at_price_min}
          omnibusPrice={product.omnibus_price_min}
          isOnSale={product.is_on_sale}
          size="base"
        />

        {/* Attribute pills */}
        {attributeEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {attributeEntries.map(([key, values]) => (
              <span
                key={key}
                className="border-border text-foreground/80 inline-flex items-baseline gap-1 rounded-md border px-2 py-0.5 text-xs"
              >
                <span className="text-muted-foreground font-medium">{key}:</span>
                <span>{values.join(', ')}</span>
              </span>
            ))}
          </div>
        )}

        {/* Short description — only if no attributes */}
        {attributeEntries.length === 0 && product.short_description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{product.short_description}</p>
        )}

        {/* Availability + actions row */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {/* Availability */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              product.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-muted-foreground'}`}
            />
            {product.is_active
              ? t('product.in_stock', 'In stock')
              : t('product.unavailable', 'Unavailable')}
          </span>

          {/* Add to cart */}
          <button
            onClick={() => {
              if (!firstVariantId) return;
              addToCart(
                { variant_id: firstVariantId, quantity: 1 },
                { onSuccess: () => toast.success(t('product.added_to_cart', 'Added to cart!')) },
              );
            }}
            disabled={!product.is_active || !firstVariantId || isPending}
            className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {isPending ? t('product.adding', 'Adding…') : t('product.add_to_cart', 'Add to Cart')}
          </button>

          {/* Wishlist */}
          {firstVariantId > 0 && (
            <button
              onClick={handleWishlistToggle}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className="border-input hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-lg border"
            >
              <Heart
                className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-foreground/60'}`}
              />
            </button>
          )}

          {/* Compare */}
          <CompareButton productId={product.id} iconOnly />
        </div>
      </div>
    </div>
  );
}
