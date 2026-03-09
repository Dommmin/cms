"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";

import { useWishlist, useRemoveFromWishlist } from "@/hooks/use-wishlist";
import { useAddToCart } from "@/hooks/use-cart";
import { useLocalePath } from "@/hooks/use-locale";
import { formatPrice } from "@/lib/format";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { mutate: addToCart } = useAddToCart();
  const lp = useLocalePath();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  const items = wishlist?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Save products you love and come back to them later.
        </p>
        <Link
          href={lp("/products")}
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Wishlist{" "}
        <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* Image */}
            <Link href={lp(`/products/${item.product.slug}`)}>
              <div className="relative aspect-square overflow-hidden bg-muted">
                {item.product.thumbnail?.url ? (
                  <Image
                    src={item.product.thumbnail.url}
                    alt={item.product.thumbnail.alt ?? item.product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </Link>

            {/* Remove */}
            <button
              onClick={() => removeFromWishlist(item.variant_id)}
              aria-label="Remove from wishlist"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow backdrop-blur-sm hover:bg-background"
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </button>

            {/* Info */}
            <div className="flex flex-col gap-2 p-3">
              <Link
                href={lp(`/products/${item.product.slug}`)}
                className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
              >
                {item.product.name}
              </Link>

              {Object.keys(item.variant.attributes).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Object.values(item.variant.attributes).join(" / ")}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="font-semibold">{formatPrice(item.variant.price)}</span>
                <button
                  onClick={() =>
                    addToCart(
                      { variant_id: item.variant_id, quantity: 1 },
                      { onSuccess: () => toast.success("Added to cart!") },
                    )
                  }
                  aria-label="Add to cart"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90"
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
