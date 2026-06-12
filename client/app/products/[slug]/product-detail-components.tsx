'use client';

import { Share2, ShoppingCart, Star, ThumbsUp, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { useSubscribeStock } from '@/hooks/use-products';

import { CompareButton } from '@/components/compare-button';
import { LiveViewers } from '@/components/live-viewers';
import { ProductCard } from '@/components/product-card';
import { getRenderableMetafields } from '@/lib/metafields';
import { getProductSpecificationEntries } from '@/lib/product-attributes';
import { sanitizeHtml } from '@/lib/sanitize';
import type {
    DeliveryPanelProps,
    ProductBuyBoxProps,
    ProductGalleryProps,
    ProductTabsProps,
    RelatedProductsProps,
    ReviewsSectionProps,
    StarRatingProps,
    VariantSelectorProps,
} from './product-detail-components.types';

export function StarRating({ value, onChange }: StarRatingProps) {
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
                    className={onChange ? 'cursor-pointer' : 'cursor-default'}
                    aria-label={`${n} star`}
                >
                    <Star
                        className={`h-5 w-5 ${n <= display ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                    />
                </button>
            ))}
        </div>
    );
}

export function ProductGallery({
    product,
    activeImageIndex,
    onImageSelect,
    noImageLabel,
}: ProductGalleryProps) {
    const images = product.images ?? [];
    const activeImage = images[activeImageIndex] ?? null;

    return (
        <div>
            <div className="bg-muted/70 relative aspect-square overflow-hidden rounded-[var(--store-card-radius)]">
                {activeImage ? (
                    <Image
                        src={activeImage.url}
                        alt={activeImage.alt ?? product.name}
                        fill
                        priority
                        className="object-contain p-4 sm:p-6"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                ) : product.thumbnail ? (
                    <Image
                        src={product.thumbnail.url}
                        alt={product.thumbnail.alt ?? product.name}
                        fill
                        priority
                        className="object-contain p-4 sm:p-6"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                        {noImageLabel}
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => onImageSelect(i)}
                            aria-label={
                                img.alt ?? `${product.name} image ${i + 1}`
                            }
                            aria-pressed={i === activeImageIndex}
                            className={`bg-muted/70 relative aspect-square overflow-hidden rounded-[var(--store-control-radius)] border-2 ${i === activeImageIndex ? 'border-primary' : 'border-transparent'}`}
                        >
                            <Image
                                src={img.url}
                                alt=""
                                fill
                                className="object-contain p-1.5"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function VariantSelector({
    variantAttributeGroups,
    selectedVariant,
    onSelectAttribute,
    isAttributeValueSelectable,
    selectVariantLabel,
}: VariantSelectorProps) {
    if (variantAttributeGroups.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <p className="mb-3 text-sm font-medium">{selectVariantLabel}</p>
            <div className="space-y-4">
                {variantAttributeGroups.map(([attributeName, values]) => (
                    <div key={attributeName}>
                        <p className="text-muted-foreground mb-2 text-sm font-medium">
                            {attributeName}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {values.map((value) => {
                                const isSelected =
                                    selectedVariant?.attributes?.[
                                        attributeName
                                    ] === value;
                                const isSelectable = isAttributeValueSelectable(
                                    attributeName,
                                    value,
                                );

                                return (
                                    <button
                                        key={`${attributeName}-${value}`}
                                        type="button"
                                        onClick={() =>
                                            onSelectAttribute(
                                                attributeName,
                                                value,
                                            )
                                        }
                                        disabled={!isSelectable}
                                        aria-pressed={isSelected}
                                        className={`min-h-11 rounded-[var(--store-control-radius)] border px-3 text-sm disabled:opacity-40 ${
                                            isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input hover:bg-accent'
                                        }`}
                                    >
                                        {value}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DeliveryPanel({
    product,
    selectedVariant,
    labels,
}: DeliveryPanelProps) {
    const inStock =
        product.is_active &&
        (selectedVariant ? selectedVariant.stock_quantity > 0 : true);

    return (
        <div className="border-border bg-card mt-6 grid gap-3 rounded-[var(--store-card-radius)] border p-4 shadow-[var(--store-shadow-soft)] sm:grid-cols-2">
            <div className="flex gap-3">
                <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                />
                <div>
                    <p className="text-sm font-medium">
                        {inStock ? labels.inStock : labels.unavailable}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {labels.deliveryHint}
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <Truck className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                    <p className="text-sm font-medium">{labels.returns}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {labels.returnsHint}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function ProductBuyBox({
    product,
    selectedVariant,
    variantAttributeGroups,
    quantity,
    avgRating,
    totalReviews,
    price,
    compareAtPrice,
    omnibusPrice,
    isPending,
    onQuantityChange,
    onAddToCart,
    onShare,
    onSelectAttribute,
    isAttributeValueSelectable,
    userEmail,
    labels,
}: ProductBuyBoxProps) {
    const [email, setEmail] = useState(userEmail || '');
    const [prevUserEmail, setPrevUserEmail] = useState(userEmail);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const { mutate: subscribeStock, isPending: isSubscribing } =
        useSubscribeStock();

    if (userEmail !== prevUserEmail) {
        setPrevUserEmail(userEmail);
        setEmail(userEmail || '');
    }

    const isOutOfStock = selectedVariant
        ? selectedVariant.stock_quantity <= 0 &&
          !selectedVariant.backorder_allowed
        : true;

    function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        const variantId = selectedVariant?.id ?? product.variants?.[0]?.id;
        if (!variantId) {
            toast.error('No variant selected');
            return;
        }

        subscribeStock(
            { variantId, email },
            {
                onSuccess: (response) => {
                    const res = response as { status: string };
                    if (res.status === 'already_subscribed') {
                        toast.info(labels.notifyAlreadySubscribed);
                    } else {
                        toast.success(labels.notifySuccess);
                        setIsSubscribed(true);
                    }
                },
                onError: () => {
                    toast.error('Something went wrong. Please try again.');
                },
            },
        );
    }

    return (
        <div>
            {product.brand && (
                <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    {product.brand.name}
                </p>
            )}
            <h1 className="mt-1 text-2xl leading-tight font-bold sm:text-3xl">
                {product.name}
            </h1>

            {avgRating && (
                <div className="mt-2 flex items-center gap-2">
                    <StarRating value={Math.round(avgRating)} />
                    <span className="text-muted-foreground text-sm">
                        {avgRating} ({totalReviews}{' '}
                        {totalReviews === 1
                            ? labels.reviewSingular
                            : labels.reviewPlural}
                        )
                    </span>
                </div>
            )}

            <div className="mt-3">
                <p className="text-2xl font-semibold">{price}</p>
                <div className="mt-1">
                    <LiveViewers />
                </div>
                {compareAtPrice && (
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-sm">
                        <span className="line-through">{compareAtPrice}</span>
                        {omnibusPrice && (
                            <span>
                                {labels.omnibus}:{' '}
                                <span className="font-medium">
                                    {omnibusPrice}
                                </span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            <VariantSelector
                variantAttributeGroups={variantAttributeGroups}
                selectedVariant={selectedVariant}
                onSelectAttribute={onSelectAttribute}
                isAttributeValueSelectable={isAttributeValueSelectable}
                selectVariantLabel={labels.selectVariant}
            />

            {isOutOfStock ? (
                <div className="border-border bg-card mt-6 rounded-[var(--store-card-radius)] border p-5 shadow-[var(--store-shadow-soft)]">
                    <p className="mb-2 text-sm font-semibold">
                        {labels.notifyWhenAvailable}
                    </p>
                    {isSubscribed ? (
                        <p className="text-sm font-medium text-green-600">
                            {labels.notifySuccess}
                        </p>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={labels.notifyEmailPlaceholder}
                                className="border-input bg-background focus:ring-ring min-h-11 flex-1 rounded-[var(--store-control-radius)] border px-4 text-sm focus:ring-2 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="bg-primary text-primary-foreground min-h-11 rounded-[var(--store-control-radius)] px-5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                            >
                                {isSubscribing ? '...' : labels.notifySubmit}
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium">
                            {labels.quantity}
                        </span>
                        <div className="border-border flex min-h-11 items-center rounded-[var(--store-control-radius)] border">
                            <button
                                type="button"
                                onClick={() =>
                                    onQuantityChange((value) =>
                                        Math.max(1, value - 1),
                                    )
                                }
                                className="text-muted-foreground hover:text-foreground h-11 px-3 text-lg leading-none"
                                aria-label={labels.decreaseQuantity}
                            >
                                -
                            </button>
                            <span className="min-w-[2.5rem] text-center text-sm font-semibold">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onQuantityChange((value) => value + 1)
                                }
                                className="text-muted-foreground hover:text-foreground h-11 px-3 text-lg leading-none"
                                aria-label={labels.increaseQuantity}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onAddToCart}
                        disabled={isPending || !product.is_active}
                        aria-busy={isPending}
                        className="bg-primary text-primary-foreground mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--store-control-radius)] px-6 font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        {isPending ? labels.adding : labels.addToCart}
                    </button>
                </>
            )}

            <div className="mt-3 flex gap-2">
                <CompareButton
                    productId={product.id}
                    className="min-h-11 flex-1 justify-center"
                />
                <button
                    type="button"
                    onClick={onShare}
                    className="border-input hover:bg-accent inline-flex min-h-11 items-center gap-2 rounded-[var(--store-control-radius)] border px-4 text-sm font-medium"
                    aria-label={labels.share}
                >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{labels.share}</span>
                </button>
            </div>

            <DeliveryPanel
                product={product}
                selectedVariant={selectedVariant}
                labels={labels}
            />

            {product.short_description && (
                <p className="text-muted-foreground mt-6">
                    {product.short_description}
                </p>
            )}
        </div>
    );
}

export function ProductTabs({
    activeTab,
    product,
    reviews,
    totalReviews,
    userExists,
    reviewSubmitted,
    rating,
    reviewTitle,
    reviewBody,
    isSubmitting,
    loginHref,
    onTabChange,
    onReviewSubmit,
    onRatingChange,
    onReviewTitleChange,
    onReviewBodyChange,
    onMarkHelpful,
    labels,
}: ProductTabsProps) {
    const specifications = getProductSpecificationEntries(product, {
        trueLabel: labels.yes,
        falseLabel: labels.no,
    });
    const renderableMetafields = getRenderableMetafields(
        'product',
        product.metafields,
    );

    return (
        <div className="mt-12">
            <div
                role="tablist"
                aria-label={labels.tabs}
                className="border-border flex gap-1 border-b"
            >
                {(['description', 'reviews'] as const).map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        id={`tab-${tab}`}
                        aria-selected={activeTab === tab}
                        aria-controls={`tabpanel-${tab}`}
                        onClick={() => onTabChange(tab)}
                        className={`min-h-11 px-4 text-sm font-medium capitalize ${
                            activeTab === tab
                                ? 'border-primary text-foreground border-b-2'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab === 'description'
                            ? labels.description
                            : labels.reviews}
                        {tab === 'reviews' && totalReviews > 0
                            ? ` (${totalReviews})`
                            : ''}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {activeTab === 'description' && (
                    <div
                        role="tabpanel"
                        id="tabpanel-description"
                        aria-labelledby="tab-description"
                        className="space-y-8"
                    >
                        {specifications.length > 0 && (
                            <section
                                aria-label={labels.specifications}
                                className="border-border bg-card rounded-[var(--store-card-radius)] border"
                            >
                                <div className="border-border border-b px-5 py-4">
                                    <h2 className="text-base font-semibold">
                                        {labels.specifications}
                                    </h2>
                                </div>
                                <dl className="divide-border divide-y">
                                    {specifications.map((attribute) => (
                                        <div
                                            key={attribute.slug}
                                            className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-6"
                                        >
                                            <dt className="text-muted-foreground text-sm font-medium">
                                                {attribute.label}
                                            </dt>
                                            <dd className="text-sm font-medium">
                                                {attribute.values.join(', ')}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}

                        {renderableMetafields.length > 0 && (
                            <section className="border-border bg-card rounded-[var(--store-card-radius)] border">
                                <div className="border-border border-b px-5 py-4">
                                    <h2 className="text-base font-semibold">
                                        Extra details
                                    </h2>
                                </div>
                                <div className="space-y-4 px-5 py-4">
                                    {renderableMetafields.map((metafield) => (
                                        <div
                                            key={`${metafield.namespace}::${metafield.key}`}
                                        >
                                            <p className="text-muted-foreground text-sm font-medium">
                                                {metafield.label}
                                            </p>
                                            {metafield.html ? (
                                                <div
                                                    className="prose prose-sm mt-2"
                                                    dangerouslySetInnerHTML={{
                                                        __html: metafield.html,
                                                    }}
                                                />
                                            ) : (
                                                <p className="mt-1 text-sm">
                                                    {metafield.value}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div
                            className="prose prose-lg"
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtml(product.description ?? ''),
                            }}
                        />
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div
                        role="tabpanel"
                        id="tabpanel-reviews"
                        aria-labelledby="tab-reviews"
                    >
                        <ReviewsSection
                            reviews={reviews}
                            userExists={userExists}
                            reviewSubmitted={reviewSubmitted}
                            rating={rating}
                            reviewTitle={reviewTitle}
                            reviewBody={reviewBody}
                            isSubmitting={isSubmitting}
                            loginHref={loginHref}
                            onReviewSubmit={onReviewSubmit}
                            onRatingChange={onRatingChange}
                            onReviewTitleChange={onReviewTitleChange}
                            onReviewBodyChange={onReviewBodyChange}
                            onMarkHelpful={onMarkHelpful}
                            labels={labels}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export function ReviewsSection({
    reviews,
    userExists,
    reviewSubmitted,
    rating,
    reviewTitle,
    reviewBody,
    isSubmitting,
    loginHref,
    onReviewSubmit,
    onRatingChange,
    onReviewTitleChange,
    onReviewBodyChange,
    onMarkHelpful,
    labels,
}: ReviewsSectionProps) {
    return (
        <div className="space-y-8">
            {reviews.length === 0 ? (
                <p className="text-muted-foreground">{labels.noReviews}</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="border-border rounded-[var(--store-card-radius)] border p-4"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {review.author}
                                        </span>
                                        {review.is_verified_purchase && (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                                {labels.verified}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <StarRating value={review.rating} />
                                        <span className="text-muted-foreground text-xs">
                                            {new Date(
                                                review.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {review.title && (
                                <p className="mt-2 font-medium">
                                    {review.title}
                                </p>
                            )}
                            <p className="text-muted-foreground mt-1 text-sm">
                                {review.body}
                            </p>
                            <div className="mt-3">
                                <button
                                    onClick={() => onMarkHelpful(review.id)}
                                    aria-label={labels.markHelpful.replace(
                                        '{author}',
                                        review.author,
                                    )}
                                    className="border-border text-muted-foreground hover:bg-accent hover:text-foreground inline-flex min-h-9 items-center gap-1.5 rounded-[var(--store-control-radius)] border px-2.5 text-xs"
                                >
                                    <ThumbsUp
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {labels.helpful} ({review.helpful_count}
                                        )
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {userExists ? (
                reviewSubmitted ? (
                    <div className="rounded-[var(--store-card-radius)] border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                        {labels.thankYou}
                    </div>
                ) : (
                    <form
                        onSubmit={onReviewSubmit}
                        className="border-border bg-card rounded-[var(--store-card-radius)] border p-6"
                    >
                        <h3 className="mb-4 font-semibold">
                            {labels.writeReview}
                        </h3>

                        <div className="mb-4">
                            <p
                                id="review-rating-label"
                                className="mb-1 block text-sm font-medium"
                            >
                                {labels.rating} *
                            </p>
                            <div aria-labelledby="review-rating-label">
                                <StarRating
                                    value={rating}
                                    onChange={onRatingChange}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="review-title"
                                className="mb-1 block text-sm font-medium"
                            >
                                {labels.title}{' '}
                                <span className="text-muted-foreground font-normal">
                                    ({labels.optional})
                                </span>
                            </label>
                            <input
                                id="review-title"
                                type="text"
                                value={reviewTitle}
                                onChange={(e) =>
                                    onReviewTitleChange(e.target.value)
                                }
                                placeholder={labels.titlePlaceholder}
                                className="border-input bg-background focus:ring-ring min-h-11 w-full rounded-[var(--store-control-radius)] border px-4 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="review-body"
                                className="mb-1 block text-sm font-medium"
                            >
                                {labels.review} *
                            </label>
                            <textarea
                                id="review-body"
                                required
                                value={reviewBody}
                                onChange={(e) =>
                                    onReviewBodyChange(e.target.value)
                                }
                                rows={4}
                                placeholder={labels.bodyPlaceholder}
                                className="border-input bg-background focus:ring-ring w-full rounded-[var(--store-control-radius)] border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="bg-primary text-primary-foreground min-h-11 rounded-[var(--store-control-radius)] px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                            {isSubmitting ? labels.submitting : labels.submit}
                        </button>
                    </form>
                )
            ) : (
                <div className="border-border bg-card text-muted-foreground rounded-[var(--store-card-radius)] border p-4 text-center text-sm">
                    <Link
                        href={loginHref}
                        className="text-primary font-medium underline"
                    >
                        {labels.login}
                    </Link>{' '}
                    {labels.loginSuffix}
                </div>
            )}
        </div>
    );
}

export function RelatedProducts({ products, title }: RelatedProductsProps) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">{title}</h2>
            <div className="grid grid-cols-2 gap-[var(--store-grid-gap)] sm:grid-cols-3 lg:grid-cols-4">
                {products.slice(0, 4).map((related) => (
                    <ProductCard key={related.id} product={related} />
                ))}
            </div>
        </section>
    );
}
