"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProduct, getProductReviews, getProducts, getProductsByCategory } from "@/api/products";
import { api } from "@/lib/axios";
import type { ProductFilters } from "@/api/products";

export const productKeys = {
  all: ["products"] as const,
  list: (filters: ProductFilters) => ["products", "list", filters] as const,
  detail: (slug: string) => ["products", "detail", slug] as const,
  reviews: (slug: string, page?: number) => ["products", slug, "reviews", page] as const,
  byCategory: (categorySlug: string, filters: ProductFilters) =>
    ["products", "category", categorySlug, filters] as const,
};

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
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
  filters: Omit<ProductFilters, "category"> = {},
) {
  return useQuery({
    queryKey: productKeys.byCategory(categorySlug, filters),
    queryFn: () => getProductsByCategory(categorySlug, filters),
    enabled: !!categorySlug,
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
    mutationFn: (payload: { rating: number; title?: string; body: string }) =>
      api.post(`/products/${slug}/reviews`, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.reviews(slug) });
    },
  });
}

export function useMarkReviewHelpful(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) =>
      api.post(`/reviews/${reviewId}/helpful`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.reviews(slug) });
    },
  });
}
