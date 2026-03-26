'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { PriceDisplay } from '@/components/price-display';
import { useAddToCart } from '@/hooks/use-cart';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { useRemoveFromWishlist, useWishlist } from '@/hooks/use-wishlist';

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { mutate: addToCart } = useAddToCart();
  const lp = useLocalePath();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-muted aspect-square animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const items = wishlist?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <Heart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Save products you love and come back to them later.
        </p>
        <Link
          href={lp('/products')}
          className="bg-primary text-primary-foreground mt-6 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Wishlist <span className="text-muted-foreground text-sm font-normal">({items.length})</span>
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group border-border bg-card relative flex flex-col overflow-hidden rounded-xl border"
          >
            {/* Image */}
            <Link href={lp(`/products/${item.product.slug}`)}>
              <div className="bg-muted relative aspect-square overflow-hidden">
                {item.product.thumbnail?.url ? (
                  <Image
                    src={item.product.thumbnail.url}
                    alt={item.product.thumbnail.alt ?? item.product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    No image
                  </div>
                )}
              </div>
            </Link>

            {/* Remove */}
            <button
              onClick={() => removeFromWishlist(item.variant_id)}
              aria-label="Remove from wishlist"
              className="bg-background/80 hover:bg-background absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow backdrop-blur-sm"
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </button>

            {/* Info */}
            <div className="flex flex-col gap-2 p-3">
              <Link
                href={lp(`/products/${item.product.slug}`)}
                className="line-clamp-2 text-sm leading-snug font-medium hover:underline"
              >
                {item.product.name}
              </Link>

              {Object.keys(item.variant.attributes).length > 0 && (
                <p className="text-muted-foreground text-xs">
                  {Object.values(item.variant.attributes).join(' / ')}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2">
                <PriceDisplay
                  price={item.variant.price}
                  compareAtPrice={item.variant.compare_at_price}
                  omnibusPrice={item.variant.omnibus_price}
                  isOnSale={item.variant.is_on_sale}
                />
                <button
                  onClick={() =>
                    addToCart(
                      { variant_id: item.variant_id, quantity: 1 },
                      {
                        onSuccess: () =>
                          toast.success(t('product.added_to_cart', 'Added to cart!')),
                      },
                    )
                  }
                  aria-label="Add to cart"
                  className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:opacity-90"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
