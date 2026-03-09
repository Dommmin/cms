"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";

import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from "@/hooks/use-wishlist";
import { useMe } from "@/hooks/use-auth";
import { CompareButton } from "@/components/compare-button";
import type { Product } from "@/types/api";

interface Props {
  product: Product;
  currency?: string;
}

export function ProductCard({ product, currency = "USD" }: Props) {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const price = formatPrice(product.price_min, currency);

  const firstVariantId = product.variants?.[0]?.id ?? 0;
  const { data: user } = useMe();
  const inWishlist = useIsInWishlist(firstVariantId);
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = lp("/login");
      return;
    }
    if (inWishlist) {
      removeFromWishlist(firstVariantId);
    } else {
      addToWishlist(firstVariantId, {
        onSuccess: () => toast.success(t("wishlist.added", "Added to wishlist")),
      });
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <Link href={lp(`/products/${product.slug}`)} className="flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.thumbnail?.url ? (
            <Image
              src={product.thumbnail.url}
              alt={product.thumbnail.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {t("product.no_image", "No image")}
            </div>
          )}

          {!product.is_active ? (
            <span className="absolute left-2 top-2 rounded bg-destructive px-2 py-0.5 text-xs font-medium text-white">
              {t("product.unavailable", "Unavailable")}
            </span>
          ) : product.is_on_sale ? (
            <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {product.discount_percentage
                ? `-${product.discount_percentage}%`
                : t("product.sale", "Sale")}
            </span>
          ) : null}

          {/* Wishlist toggle */}
          {firstVariantId > 0 && (
            <button
              onClick={handleWishlistToggle}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow backdrop-blur-sm transition-colors hover:bg-background"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  inWishlist ? "fill-red-500 text-red-500" : "text-foreground/60"
                }`}
              />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 p-4">
          {product.brand && (
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.brand.name}
            </span>
          )}
          <h3 className="line-clamp-2 font-medium leading-snug">{product.name}</h3>
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="text-lg font-semibold">{price}</span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <CompareButton productId={product.id} className="w-full justify-center" />
      </div>
    </div>
  );
}
