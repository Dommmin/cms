import type { Dispatch, FormEvent, SetStateAction } from 'react';

import type { Product, ProductReview, ProductVariant } from '@/types/api';

export interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
}

export interface ProductGalleryProps {
    product: Product;
    activeImageIndex: number;
    onImageSelect: (index: number) => void;
    noImageLabel: string;
}

export interface VariantSelectorProps {
    variantAttributeGroups: [string, string[]][];
    selectedVariant: ProductVariant | undefined;
    onSelectAttribute: (attributeName: string, value: string) => void;
    isAttributeValueSelectable: (
        attributeName: string,
        value: string,
    ) => boolean;
    selectVariantLabel: string;
}

export interface DeliveryPanelProps {
    product: Product;
    selectedVariant: ProductVariant | undefined;
    labels: {
        inStock: string;
        unavailable: string;
        delivery: string;
        deliveryHint: string;
        returns: string;
        returnsHint: string;
    };
}

export interface ProductBuyBoxProps {
    product: Product;
    selectedVariant: ProductVariant | undefined;
    variantAttributeGroups: [string, string[]][];
    quantity: number;
    avgRating: number | null;
    totalReviews: number;
    price: string;
    compareAtPrice: string | null;
    omnibusPrice: string | null;
    isPending: boolean;
    onQuantityChange: Dispatch<SetStateAction<number>>;
    onAddToCart: () => void;
    onShare: () => void;
    onSelectAttribute: (attributeName: string, value: string) => void;
    isAttributeValueSelectable: (
        attributeName: string,
        value: string,
    ) => boolean;
    labels: {
        selectVariant: string;
        quantity: string;
        decreaseQuantity: string;
        increaseQuantity: string;
        adding: string;
        addToCart: string;
        share: string;
        reviewSingular: string;
        reviewPlural: string;
        omnibus: string;
        delivery: string;
        deliveryHint: string;
        returns: string;
        returnsHint: string;
        inStock: string;
        unavailable: string;
    };
}

export interface ProductTabsProps {
    activeTab: 'description' | 'reviews';
    product: Product;
    reviews: ProductReview[];
    totalReviews: number;
    userExists: boolean;
    reviewSubmitted: boolean;
    rating: number;
    reviewTitle: string;
    reviewBody: string;
    isSubmitting: boolean;
    loginHref: string;
    onTabChange: (tab: 'description' | 'reviews') => void;
    onReviewSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onRatingChange: (value: number) => void;
    onReviewTitleChange: (value: string) => void;
    onReviewBodyChange: (value: string) => void;
    onMarkHelpful: (reviewId: number) => void;
    labels: {
        tabs: string;
        description: string;
        reviews: string;
        noReviews: string;
        verified: string;
        helpful: string;
        markHelpful: string;
        writeReview: string;
        rating: string;
        optional: string;
        title: string;
        review: string;
        titlePlaceholder: string;
        bodyPlaceholder: string;
        submitting: string;
        submit: string;
        thankYou: string;
        login: string;
        loginSuffix: string;
    };
}

export interface ReviewsSectionProps {
    reviews: ProductReview[];
    userExists: boolean;
    reviewSubmitted: boolean;
    rating: number;
    reviewTitle: string;
    reviewBody: string;
    isSubmitting: boolean;
    loginHref: string;
    onReviewSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onRatingChange: (value: number) => void;
    onReviewTitleChange: (value: string) => void;
    onReviewBodyChange: (value: string) => void;
    onMarkHelpful: (reviewId: number) => void;
    labels: ProductTabsProps['labels'];
}

export interface RelatedProductsProps {
    products: Product[] | undefined;
    title: string;
}
