'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { PriceDisplay } from '@/components/price-display';
import { useMe } from '@/hooks/use-auth';
import { useAddToCart } from '@/hooks/use-cart';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from '@/hooks/use-wishlist';
import type { ProductCardProps } from './product-card.types';

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const firstVariantId = product.variants?.[0]?.id ?? 0;
  const { data: user } = useMe();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const inWishlist = useIsInWishlist(firstVariantId);
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

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
    <div className="group border-border bg-card flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-lg">
      <Link href={lp(`/products/${product.slug}`)} className="flex flex-1 flex-col">
        <div className="bg-muted relative aspect-square overflow-hidden">
          {product.thumbnail?.url ? (
            <Image
              src={product.thumbnail.url}
              alt={product.thumbnail.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              {t('product.no_image', 'No image')}
            </div>
          )}

          {!product.is_active ? (
            <span className="bg-destructive absolute top-2 left-2 rounded px-2 py-0.5 text-xs font-medium text-white">
              {t('product.unavailable', 'Unavailable')}
            </span>
          ) : product.is_on_sale ? (
            <span className="bg-primary text-primary-foreground absolute top-2 left-2 rounded px-2 py-0.5 text-xs font-semibold">
              {product.discount_percentage
                ? `-${product.discount_percentage}%`
                : t('product.sale', 'Sale')}
            </span>
          ) : null}

          {/* Wishlist toggle */}
          {firstVariantId > 0 && (
            <button
              onClick={handleWishlistToggle}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className="bg-background/80 hover:bg-background absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow backdrop-blur-sm transition-colors cursor-pointer"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  inWishlist ? 'fill-red-500 text-red-500' : 'text-foreground/60'
                }`}
              />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 p-4">
          {product.brand && (
            <span className="text-muted-foreground text-xs tracking-wide uppercase">
              {product.brand.name}
            </span>
          )}
          <h3 className="line-clamp-2 leading-snug font-medium">{product.name}</h3>
          <PriceDisplay
            price={product.price_min}
            compareAtPrice={product.compare_at_price_min}
            omnibusPrice={product.omnibus_price_min}
            isOnSale={product.is_on_sale}
            className="mt-auto pt-2"
          />
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!firstVariantId) return;
            addToCart(
              { variant_id: firstVariantId, quantity: 1 },
              { onSuccess: () => toast.success(t('product.added_to_cart', 'Added to cart!')) },
            );
          }}
          disabled={!product.is_active || !firstVariantId || isAddingToCart}
          className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4" />
          {isAddingToCart
            ? t('product.adding', 'Adding…')
            : t('product.add_to_cart', 'Add to Cart')}
        </button>
      </div>
    </div>
  );
}
