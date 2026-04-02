'use client';

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import type { ProductFilters } from '@/api/products';
import {
    getProduct,
    getProductReviews,
    getProducts,
    getProductsByCategory,
} from '@/api/products';
import { apiGetMany, apiPost } from '@/lib/api';
import type { Product } from '@/types/api';

export const productKeys = {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    related: (slug: string) => ['products', slug, 'related'] as const,
    reviews: (slug: string, page?: number) =>
        ['products', slug, 'reviews', page] as const,
    byCategory: (categorySlug: string, filters: ProductFilters) =>
        ['products', 'category', categorySlug, filters] as const,
};

export function useProducts(filters: ProductFilters = {}) {
    return useQuery({
        queryKey: productKeys.list(filters),
        queryFn: () => getProducts(filters),
        placeholderData: keepPreviousData,
    });
}

export function useProduct(slug: string) {
    return useQuery({
        queryKey: productKeys.detail(slug),
        queryFn: () => getProduct(slug),
        enabled: !!slug,
    });
}

export function useProductsByCategory(
    categorySlug: string,
    filters: Omit<ProductFilters, 'category'> = {},
) {
    return useQuery({
        queryKey: productKeys.byCategory(categorySlug, filters),
        queryFn: () => getProductsByCategory(categorySlug, filters),
        enabled: !!categorySlug,
    });
}

export function useRelatedProducts(slug: string) {
    return useQuery({
        queryKey: productKeys.related(slug),
        queryFn: async () => {
            const products = await apiGetMany<Product>(
                `/products/${slug}/related`,
            );

            return Array.isArray(products) ? products : [];
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProductReviews(slug: string, page = 1) {
    return useQuery({
        queryKey: productKeys.reviews(slug, page),
        queryFn: () => getProductReviews(slug, { page }),
        enabled: !!slug,
    });
}

export function useSubmitReview(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            rating: number;
            title?: string;
            body: string;
        }) => apiPost(`/products/${slug}/reviews`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: productKeys.reviews(slug),
            });
        },
    });
}

export function useMarkReviewHelpful(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: number) =>
            apiPost(`/reviews/${reviewId}/helpful`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: productKeys.reviews(slug),
            });
        },
    });
}
