'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Breadcrumb } from '@/components/breadcrumb';
import { JsonLd } from '@/components/json-ld';
import { RecentlyViewed } from '@/components/recently-viewed';
import { useMe } from '@/hooks/use-auth';
import { useAddToCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import {
    useMarkReviewHelpful,
    useProduct,
    useProductReviews,
    useRelatedProducts,
    useSubmitReview,
} from '@/hooks/use-products';
import { addRecentlyViewed } from '@/hooks/use-recently-viewed';
import { useTranslation } from '@/hooks/use-translation';
import { trackViewItem } from '@/lib/datalayer';
import { buildBreadcrumbList, buildProduct } from '@/lib/schema';
import { generateCanonical } from '@/lib/seo';
import {
    ProductBuyBox,
    ProductGallery,
    ProductTabs,
    RelatedProducts,
} from './product-detail-components';

export default function ProductDetailClient({ slug }: { slug: string }) {
    const { data: product, isLoading } = useProduct(slug);
    const { data: reviewsData } = useProductReviews(slug);
    const { data: relatedProducts } = useRelatedProducts(slug);
    const { mutate: addToCart, isPending } = useAddToCart();
    const {
        mutate: submitReview,
        isPending: isSubmitting,
        isSuccess: reviewSubmitted,
    } = useSubmitReview(slug);
    const { mutate: markHelpful } = useMarkReviewHelpful(slug);
    const { data: user } = useMe();
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { formatPrice } = useCurrency();

    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        null,
    );
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>(
        'description',
    );
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        if (product) {
            trackViewItem({
                id: product.id,
                name: product.name,
                price: product.price_min,
            });
            addRecentlyViewed(product);
        }
    }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Review form state
    const [rating, setRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewBody, setReviewBody] = useState('');

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="bg-muted aspect-square animate-pulse rounded-xl" />
                    <div className="space-y-4">
                        <div className="bg-muted h-8 w-3/4 animate-pulse rounded" />
                        <div className="bg-muted h-6 w-1/4 animate-pulse rounded" />
                        <div className="bg-muted h-24 animate-pulse rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="py-24 text-center">
                <p className="text-muted-foreground">
                    {t('product.not_found', 'Product not found.')}
                </p>
                <Link
                    href={lp('/products')}
                    className="mt-4 inline-block underline"
                >
                    {t('product.back_to_shop', 'Back to shop')}
                </Link>
            </div>
        );
    }

    const currentProduct = product;
    const selectedVariant = currentProduct.variants?.find(
        (v) => v.id === (selectedVariantId ?? currentProduct.variants?.[0]?.id),
    );
    const variantAttributeGroups = Object.entries(
        (currentProduct.variants ?? []).reduce<Record<string, string[]>>(
            (accumulator, variant) => {
                Object.entries(variant.attributes).forEach(
                    ([attributeName, value]) => {
                        if (!accumulator[attributeName]) {
                            accumulator[attributeName] = [];
                        }

                        if (!accumulator[attributeName].includes(value)) {
                            accumulator[attributeName].push(value);
                        }
                    },
                );

                return accumulator;
            },
            {},
        ),
    );
    const price = formatPrice(selectedVariant?.price ?? product.price_min);
    function handleAddToCart() {
        const variant = selectedVariant ?? product?.variants?.[0];
        if (!variant) {
            toast.error('No variant available');
            return;
        }
        addToCart(
            { variant_id: variant.id, quantity },
            {
                onSuccess: () =>
                    toast.success(t('product.added_to_cart', 'Added to cart!')),
            },
        );
    }

    async function handleShare() {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({
                title: currentProduct.name,
                url,
            });
            return;
        }

        await navigator.clipboard.writeText(url);
        toast.success(t('product.link_copied', 'Link copied!'));
    }

    function handleReviewSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        submitReview(
            { rating, title: reviewTitle || undefined, body: reviewBody },
            {
                onSuccess: () => {
                    toast.success(
                        'Review submitted — it will appear after approval.',
                    );
                    setRating(0);
                    setReviewTitle('');
                    setReviewBody('');
                },
            },
        );
    }

    const reviews = reviewsData?.data ?? [];
    const totalReviews = reviewsData?.meta?.total ?? reviews.length;
    const avgRating =
        reviews.length > 0
            ? Math.round(
                  (reviews.reduce((sum, r) => sum + r.rating, 0) /
                      reviews.length) *
                      10,
              ) / 10
            : null;

    const productUrl = generateCanonical(`/products/${product.slug}`);
    const compareAtPrice =
        selectedVariant?.compare_at_price &&
        selectedVariant.compare_at_price > selectedVariant.price
            ? formatPrice(selectedVariant.compare_at_price)
            : null;
    const omnibusPrice =
        compareAtPrice && selectedVariant?.omnibus_price !== null
            ? formatPrice(selectedVariant?.omnibus_price ?? 0)
            : null;

    const breadcrumbs = [
        { label: t('nav.products', 'Products'), href: lp('/products') },
        ...(product.category
            ? [
                  {
                      label: product.category.name,
                      href: lp(`/products?category=${product.category.slug}`),
                  },
              ]
            : []),
        { label: product.name },
    ];

    function selectVariantAttribute(attributeName: string, value: string) {
        const currentAttributes =
            selectedVariant?.attributes ??
            currentProduct.variants?.[0]?.attributes ??
            {};
        const nextAttributes = {
            ...currentAttributes,
            [attributeName]: value,
        };

        const matchingVariant = currentProduct.variants?.find((variant) =>
            Object.entries(nextAttributes).every(
                ([name, selectedValue]) =>
                    variant.attributes[name] === selectedValue,
            ),
        );

        if (matchingVariant) {
            setSelectedVariantId(matchingVariant.id);
            return;
        }

        const fallbackVariant = currentProduct.variants?.find(
            (variant) => variant.attributes[attributeName] === value,
        );

        if (fallbackVariant) {
            setSelectedVariantId(fallbackVariant.id);
        }
    }

    function isAttributeValueSelectable(
        attributeName: string,
        value: string,
    ): boolean {
        const currentAttributes =
            selectedVariant?.attributes ??
            currentProduct.variants?.[0]?.attributes ??
            {};

        return (
            currentProduct.variants?.some(
                (variant) =>
                    Object.entries(currentAttributes).every(
                        ([currentName, currentValue]) =>
                            currentName === attributeName ||
                            variant.attributes[currentName] === currentValue,
                    ) && variant.attributes[attributeName] === value,
            ) ?? false
        );
    }

    return (
        <div className="store-shell mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbs} homeHref={lp('/')} />
            <JsonLd
                data={buildProduct(product, { url: productUrl, reviews })}
            />
            <JsonLd
                data={buildBreadcrumbList([
                    { name: 'Products', url: generateCanonical('/products') },
                    ...(product.category
                        ? [
                              {
                                  name: product.category.name,
                                  url: generateCanonical(
                                      `/products?category=${product.category.slug}`,
                                  ),
                              },
                          ]
                        : []),
                    { name: product.name, url: productUrl },
                ])}
            />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                <ProductGallery
                    product={product}
                    activeImageIndex={activeImageIndex}
                    onImageSelect={setActiveImageIndex}
                    noImageLabel={t('product.no_image', 'No image')}
                />

                <ProductBuyBox
                    product={product}
                    selectedVariant={selectedVariant}
                    variantAttributeGroups={variantAttributeGroups}
                    quantity={quantity}
                    avgRating={avgRating}
                    totalReviews={totalReviews}
                    price={price}
                    compareAtPrice={compareAtPrice}
                    omnibusPrice={omnibusPrice}
                    isPending={isPending}
                    onQuantityChange={setQuantity}
                    onAddToCart={handleAddToCart}
                    onShare={handleShare}
                    onSelectAttribute={selectVariantAttribute}
                    isAttributeValueSelectable={isAttributeValueSelectable}
                    labels={{
                        selectVariant: t(
                            'product.select_variant',
                            'Select variant',
                        ),
                        quantity: t('product.quantity', 'Quantity'),
                        decreaseQuantity: t(
                            'product.decrease_quantity',
                            'Decrease quantity',
                        ),
                        increaseQuantity: t(
                            'product.increase_quantity',
                            'Increase quantity',
                        ),
                        adding: t('product.adding', 'Adding…'),
                        addToCart: t('product.add_to_cart', 'Add to Cart'),
                        share: t('product.share', 'Share'),
                        reviewSingular: t('product.review', 'review'),
                        reviewPlural: t('product.reviews', 'reviews'),
                        omnibus: t(
                            'product.omnibus_label',
                            'Lowest price in last 30 days',
                        ),
                        delivery: t('product.delivery', 'Delivery'),
                        deliveryHint: t(
                            'product.delivery_hint',
                            'Standard delivery options are available at checkout.',
                        ),
                        returns: t('product.returns', 'Returns'),
                        returnsHint: t(
                            'product.returns_hint',
                            '14-day return window for eligible products.',
                        ),
                        inStock: t('product.in_stock', 'In stock'),
                        unavailable: t('product.unavailable', 'Unavailable'),
                    }}
                />
            </div>

            <ProductTabs
                activeTab={activeTab}
                product={product}
                reviews={reviews}
                totalReviews={totalReviews}
                userExists={Boolean(user)}
                reviewSubmitted={reviewSubmitted}
                rating={rating}
                reviewTitle={reviewTitle}
                reviewBody={reviewBody}
                isSubmitting={isSubmitting}
                loginHref={lp('/login')}
                onTabChange={setActiveTab}
                onReviewSubmit={handleReviewSubmit}
                onRatingChange={setRating}
                onReviewTitleChange={setReviewTitle}
                onReviewBodyChange={setReviewBody}
                onMarkHelpful={markHelpful}
                labels={{
                    tabs: t('product.tabs_label', 'Product information'),
                    description: t('product.tab_description', 'Description'),
                    reviews: t('product.tab_reviews', 'Reviews'),
                    noReviews: t(
                        'product.no_reviews',
                        'No reviews yet. Be the first!',
                    ),
                    verified: t('product.verified', 'Verified'),
                    helpful: t('product.helpful', 'Helpful'),
                    markHelpful: t(
                        'product.mark_helpful',
                        'Mark review by {author} as helpful',
                    ),
                    writeReview: t('product.write_review', 'Write a review'),
                    rating: t('product.rating_label', 'Rating'),
                    optional: t('common.optional', 'optional'),
                    title: t('product.review_title_label', 'Title'),
                    review: t('product.review_body_label', 'Review'),
                    titlePlaceholder: t(
                        'product.review_title_placeholder',
                        'Summarise your experience…',
                    ),
                    bodyPlaceholder: t(
                        'product.review_body_placeholder',
                        'Tell others what you think about this product…',
                    ),
                    submitting: t('product.submitting', 'Submitting…'),
                    submit: t('product.submit_review', 'Submit review'),
                    thankYou: t(
                        'product.review_thank_you',
                        'Thank you for your review! It will appear after moderation.',
                    ),
                    login: t('auth.login', 'Log in'),
                    loginSuffix: t(
                        'product.login_to_review',
                        'to write a review.',
                    ),
                }}
            />

            <RelatedProducts
                products={relatedProducts}
                title={t('product.related_products', 'You may also like')}
            />

            <RecentlyViewed excludeId={product.id} />
        </div>
    );
}
