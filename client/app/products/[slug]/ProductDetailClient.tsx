"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Star, ThumbsUp } from "lucide-react";
import { toast } from "react-toastify";

import { useAddToCart } from "@/hooks/use-cart";
import { useLocalePath } from "@/hooks/use-locale";
import { useMe } from "@/hooks/use-auth";
import {
  useMarkReviewHelpful,
  useProduct,
  useProductReviews,
  useSubmitReview,
} from "@/hooks/use-products";
import { useTranslation } from "@/hooks/use-translation";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbList, buildProduct } from "@/lib/schema";
import { generateCanonical } from "@/lib/seo";
import { useCurrency } from "@/hooks/use-currency";
import { trackViewItem } from "@/lib/datalayer";
import { addRecentlyViewed } from "@/hooks/use-recently-viewed";
import { RecentlyViewed } from "@/components/recently-viewed";
import { CompareButton } from "@/components/compare-button";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star`}
        >
          <Star
            className={`h-5 w-5 ${n <= display ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { data: product, isLoading } = useProduct(slug);
  const { data: reviewsData } = useProductReviews(slug);
  const { mutate: addToCart, isPending } = useAddToCart();
  const { mutate: submitReview, isPending: isSubmitting, isSuccess: reviewSubmitted } =
    useSubmitReview(slug);
  const { mutate: markHelpful } = useMarkReviewHelpful(slug);
  const { data: user } = useMe();
  const { t } = useTranslation();
  const lp = useLocalePath();
  const { formatPrice } = useCurrency();

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      trackViewItem({ id: product.id, name: product.name, price: product.price_min });
      addRecentlyViewed(product);
    }
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Review form state
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">{t("product.not_found", "Product not found.")}</p>
        <Link href={lp("/products")} className="mt-4 inline-block underline">
          {t("product.back_to_shop", "Back to shop")}
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants?.find(
    (v) => v.id === (selectedVariantId ?? product.variants?.[0]?.id),
  );
  const price = formatPrice(selectedVariant?.price ?? product.price_min);
  const images = product.images ?? [];
  const activeImage = images[activeImageIndex] ?? null;

  function handleAddToCart() {
    const variant = selectedVariant ?? product?.variants?.[0];
    if (!variant) {
      toast.error("No variant available");
      return;
    }
    addToCart(
      { variant_id: variant.id, quantity: 1 },
      { onSuccess: () => toast.success(t("product.added_to_cart", "Added to cart!")) },
    );
  }

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    submitReview(
      { rating, title: reviewTitle || undefined, body: reviewBody },
      {
        onSuccess: () => {
          toast.success("Review submitted — it will appear after approval.");
          setRating(0);
          setReviewTitle("");
          setReviewBody("");
        },
      },
    );
  }

  const reviews = reviewsData?.data ?? [];
  const totalReviews = reviewsData?.meta?.total ?? reviews.length;
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  const productUrl = generateCanonical(`/products/${product.slug}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={buildProduct(product, { url: productUrl, reviews })} />
      <JsonLd
        data={buildBreadcrumbList([
          { name: "Products", url: generateCanonical("/products") },
          ...(product.category
            ? [
                {
                  name: product.category.name,
                  url: generateCanonical(`/products?category=${product.category.slug}`),
                },
              ]
            : []),
          { name: product.name, url: productUrl },
        ])}
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : product.thumbnail ? (
              <Image
                src={product.thumbnail.url}
                alt={product.thumbnail.alt ?? product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t("product.no_image", "No image")}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${i === activeImageIndex ? "border-primary" : "border-transparent"}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand.name}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>

          {/* Rating summary */}
          {avgRating && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-sm text-muted-foreground">
                {avgRating} ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          <div className="mt-3">
            <p className="text-2xl font-semibold">{price}</p>
            {selectedVariant?.compare_at_price &&
              selectedVariant.compare_at_price > selectedVariant.price && (
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="line-through">
                    {formatPrice(selectedVariant.compare_at_price)}
                  </span>
                  {selectedVariant.omnibus_price !== null && (
                    <span>
                      {t("product.omnibus_label", "Lowest price in last 30 days")}:{" "}
                      <span className="font-medium">
                        {formatPrice(selectedVariant.omnibus_price)}
                      </span>
                    </span>
                  )}
                </div>
              )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">
                {t("product.select_variant", "Select variant")}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const label =
                    Object.values(variant.attributes).join(" / ") ||
                    `${t("product.select_variant", "Variant")} ${variant.id}`;
                  const isSelected =
                    (selectedVariantId ?? product.variants?.[0]?.id) === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      disabled={!variant.is_available}
                      className={`rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:bg-accent"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isPending || !product.is_active}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <ShoppingCart className="h-5 w-5" />
            {isPending
              ? t("product.adding", "Adding…")
              : t("product.add_to_cart", "Add to Cart")}
          </button>
          <CompareButton productId={product.id} className="mt-3 w-full justify-center" />

          {/* Short description */}
          {product.short_description && (
            <p className="mt-6 text-muted-foreground">{product.short_description}</p>
          )}
        </div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mt-12">
        <div className="flex gap-1 border-b border-border">
          {(["description", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "description"
                ? t("product.tab_description", "Description")
                : t("product.tab_reviews", "Reviews")}
              {tab === "reviews" && totalReviews > 0 ? ` (${totalReviews})` : ""}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {/* Description tab */}
          {activeTab === "description" && (
            <div
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: product.description ?? "" }}
            />
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Review list */}
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">{t("product.no_reviews", "No reviews yet. Be the first!")}</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.author}</span>
                            {review.is_verified_purchase && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <StarRating value={review.rating} />
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <p className="mt-2 font-medium">{review.title}</p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                      {/* Helpful vote */}
                      <div className="mt-3">
                        <button
                          onClick={() => markHelpful(review.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Helpful ({review.helpful_count})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Write a review form */}
              {user ? (
                reviewSubmitted ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    Thank you for your review! It will appear after moderation.
                  </div>
                ) : (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h3 className="mb-4 font-semibold">
                      {t("product.write_review", "Write a review")}
                    </h3>

                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium">Rating *</label>
                      <StarRating value={rating} onChange={setRating} />
                    </div>

                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium">
                        Title{" "}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summarise your experience…"
                        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium">Review *</label>
                      <textarea
                        required
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        rows={4}
                        placeholder="Tell others what you think about this product…"
                        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || rating === 0}
                      className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting…" : "Submit review"}
                    </button>
                  </form>
                )
              ) : (
                <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                  <Link href={lp("/login")} className="font-medium text-primary underline">
                    Log in
                  </Link>{" "}
                  to write a review.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
