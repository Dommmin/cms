import { apiGet, apiGetPage } from '@/lib/api';
import type { PaginatedResponse, Product, ProductReview } from '@/types/api';

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
  // Spatie QueryBuilder expects filter[key]=value format
  if (filters.search) params['filter[name]'] = filters.search;
  if (filters.min_price != null) params['filter[min_price]'] = filters.min_price;
  if (filters.max_price != null) params['filter[max_price]'] = filters.max_price;
  if (filters.category) params['filter[category]'] = filters.category;
  if (filters.brand) params['filter[brand_id]'] = filters.brand;
  if (filters.attributes) {
    Object.entries(filters.attributes).forEach(([attributeSlug, values]) => {
      if (values.length > 0) {
        params[`filter[attributes][${attributeSlug}]`] = values.join(',');
      }
    });
  }
  if (filters.in_stock) params['filter[in_stock]'] = 1;
  return params;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<Product>> {
  return apiGetPage<Product>('/products', { params: buildProductParams(filters) });
}

export async function getProduct(slug: string): Promise<Product | null> {
  return apiGet<Product>(`/products/${slug}`);
}

export async function getProductsByCategory(
  categorySlug: string,
  filters: Omit<ProductFilters, 'category'> = {},
): Promise<PaginatedResponse<Product>> {
  return apiGetPage<Product>(`/categories/${categorySlug}/products`, { params: filters });
}

export async function getProductReviews(
  slug: string,
  params: { page?: number; per_page?: number } = {},
): Promise<PaginatedResponse<ProductReview>> {
  return apiGetPage<ProductReview>(`/products/${slug}/reviews`, { params });
}
