import { api } from "@/lib/axios";
import type { PaginatedResponse, Product, ProductReview } from "@/types/api";

export interface ProductFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  brand?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
}

function buildProductParams(filters: ProductFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;
  if (filters.sort) params.sort = filters.sort;
  // Spatie QueryBuilder expects filter[key]=value format
  if (filters.search) params["filter[name]"] = filters.search;
  if (filters.min_price != null) params["filter[min_price]"] = filters.min_price;
  if (filters.max_price != null) params["filter[max_price]"] = filters.max_price;
  if (filters.category) params["filter[category]"] = filters.category;
  if (filters.brand) params["filter[brand_id]"] = filters.brand;
  return params;
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>("/products", {
    params: buildProductParams(filters),
  });
  return data;
}

export async function getProduct(slug: string): Promise<Product> {
  const { data } = await api.get<{ data: Product }>(`/products/${slug}`);
  return data.data;
}

export async function getProductsByCategory(
  categorySlug: string,
  filters: Omit<ProductFilters, "category"> = {},
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>(
    `/categories/${categorySlug}/products`,
    { params: filters },
  );
  return data;
}

export async function getProductReviews(
  slug: string,
  params: { page?: number; per_page?: number } = {},
): Promise<PaginatedResponse<ProductReview>> {
  const { data } = await api.get<PaginatedResponse<ProductReview>>(
    `/products/${slug}/reviews`,
    { params },
  );
  return data;
}
