import { apiGet, apiGetMany, apiGetPage } from '@/api/client';
import type { BlogCategory, BlogPost, Category, Page, PaginatedResponse } from '@/types/api';

export function getPage(slug: string): Promise<Page | null> {
  return apiGet<Page>(`/pages/${slug}`);
}

export function getCategories(): Promise<Category[]> {
  return apiGetMany<Category>('/categories');
}

export function getBlogPosts(params: { page?: number; per_page?: number; category?: string } = {}): Promise<PaginatedResponse<BlogPost>> {
  return apiGetPage<BlogPost>('/blog/posts', { params });
}

export function getBlogPost(slug: string): Promise<BlogPost | null> {
  return apiGet<BlogPost>(`/blog/posts/${slug}`);
}

export function getBlogCategories(): Promise<BlogCategory[]> {
  return apiGetMany<BlogCategory>('/blog/categories');
}
