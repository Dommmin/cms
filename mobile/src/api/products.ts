import { api, apiGet, apiGetMany, apiGetPage } from '@/api/client';
import type { Category, CompareResponse, PaginatedResponse, Product, ProductReview } from '@/types/api';

export interface ProductFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  brand?: string;
  attributes?: Record<string, string[]>;
  sort?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

function buildProductParams(filters: ProductFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;
  if (filters.sort) params.sort = filters.sort;
  if (filters.search) params['filter[name]'] = filters.search;
  if (filters.min_price != null) params['filter[min_price]'] = filters.min_price;
  if (filters.max_price != null) params['filter[max_price]'] = filters.max_price;
  if (filters.category) params['filter[category]'] = filters.category;
  if (filters.brand) params['filter[brand_id]'] = filters.brand;
  if (filters.in_stock) params['filter[in_stock]'] = 1;
  Object.entries(filters.attributes ?? {}).forEach(([attributeSlug, values]) => {
    if (values.length > 0) {
      params[`filter[attributes][${attributeSlug}]`] = values.join(',');
    }
  });
  return params;
}

export function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  return apiGetPage<Product>('/products', { params: buildProductParams(filters) });
}

export function getProduct(slug: string): Promise<Product | null> {
  return apiGet<Product>(`/products/${slug}`);
}

export function getProductsByCategory(
  categorySlug: string,
  filters: Omit<ProductFilters, 'category'> = {},
): Promise<PaginatedResponse<Product>> {
  return apiGetPage<Product>(`/categories/${categorySlug}/products`, {
    params: buildProductParams(filters),
  });
}

export function getProductReviews(
  slug: string,
  params: { page?: number; per_page?: number } = {},
): Promise<PaginatedResponse<ProductReview>> {
  return apiGetPage<ProductReview>(`/products/${slug}/reviews`, { params });
}

export async function submitProductReview(
  slug: string,
  payload: { rating: number; title?: string; body: string },
): Promise<void> {
  await api.post(`/products/${slug}/reviews`, payload);
}

export async function markReviewHelpful(reviewId: number): Promise<void> {
  await api.post(`/reviews/${reviewId}/helpful`);
}

export function getCategories(): Promise<Category[]> {
  return apiGetMany<Category>('/categories');
}

export async function getComparisonProducts(ids: number[]): Promise<CompareResponse> {
  if (ids.length === 0) return { products: [], attributeKeys: [] };
  const params = ids.reduce<Record<string, number>>((accumulator, id, index) => {
    accumulator[`ids[${index}]`] = id;
    return accumulator;
  }, {});
  const response = await apiGet<{ data: Product[]; meta?: { attribute_keys?: string[] } }>('/products/compare', { params });

  return {
    products: response?.data ?? [],
    attributeKeys: response?.meta?.attribute_keys ?? [],
  };
}
