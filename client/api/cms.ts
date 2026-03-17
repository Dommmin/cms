import { serverFetch } from "@/lib/server-fetch";
import type { BlogCategory, BlogPost, Brand, Category, Faq, Menu, Page, PaginatedResponse } from "@/types/api";

// ── Pages ─────────────────────────────────────────────────────────────────────

export async function getPage(slug: string, locale?: string): Promise<Page> {
  const { data } = await serverFetch<{ data: Page }>(`/pages/${slug}`, { locale });
  return data;
}

// ── Menus ─────────────────────────────────────────────────────────────────────

export async function getMenu(location: string, locale?: string): Promise<Menu> {
  const { data } = await serverFetch<{ data: Menu }>(`/menus/${location}`, { locale });
  return data;
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data } = await serverFetch<{ data: Category[] }>("/categories");
  return data;
}

export async function getCategory(slug: string): Promise<Category> {
  const { data } = await serverFetch<{ data: Category }>(`/categories/${slug}`);
  return data;
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function getBlogPosts(
  params: { page?: number; per_page?: number; category?: string; locale?: string } = {},
): Promise<PaginatedResponse<BlogPost>> {
  const { locale, ...rest } = params;
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])),
  ).toString();
  return serverFetch<PaginatedResponse<BlogPost>>(`/blog/posts${query ? `?${query}` : ""}`, { locale });
}

export async function getBlogPost(slug: string, locale?: string): Promise<BlogPost> {
  const { data } = await serverFetch<{ data: BlogPost }>(`/blog/posts/${slug}`, { locale });
  return data;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data } = await serverFetch<{ data: BlogCategory[] }>("/blog/categories");
  return data;
}

// ── Brands ────────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
  const { data } = await serverFetch<{ data: Brand[] }>("/brands");
  return data;
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

export async function getFaqs(): Promise<Faq[]> {
  const { data } = await serverFetch<{ data: Faq[] }>("/faqs");
  return data;
}
