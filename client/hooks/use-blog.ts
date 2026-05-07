'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getBlogCategories, getBlogPost, getBlogPosts } from '@/api/cms';
import { apiGet, apiGetMany, apiGetPage } from '@/lib/api';
import type { BlogCategory, BlogPost, PaginatedResponse } from '@/types/api';

export interface BlogPostParams {
    page?: number;
    per_page?: number;
    category?: string;
    locale?: string;
    sort?: string;
    search?: string;
}

// ── Query key factory ─────────────────────────────────────────────────────────

export const blogKeys = {
    all: ['blog'] as const,
    posts: (params: BlogPostParams) => ['blog', 'posts', params] as const,
    post: (slug: string, locale: string) =>
        ['blog', 'post', slug, locale] as const,
    categories: () => ['blog', 'categories'] as const,
    comments: (slug: string) => ['blog', 'comments', slug] as const,
};

// ── Client-side API functions (axios, sends auth header) ──────────────────────

async function fetchBlogPostsClient(
    params: BlogPostParams,
): Promise<PaginatedResponse<BlogPost>> {
    const query = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([k, v]) => [k, String(v)]),
        ),
    ).toString();
    return apiGetPage<BlogPost>(`/blog/posts${query ? `?${query}` : ''}`);
}

async function fetchBlogPostClient(
    slug: string,
    locale: string,
): Promise<BlogPost | null> {
    return apiGet<BlogPost>(`/blog/posts/${slug}`, { params: { locale } });
}

async function fetchBlogCategoriesClient(): Promise<BlogCategory[]> {
    return apiGetMany<BlogCategory>('/blog/categories');
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useBlogPosts(params: BlogPostParams) {
    return useQuery({
        queryKey: blogKeys.posts(params),
        queryFn: () => fetchBlogPostsClient(params),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    });
}

export function useBlogPost(slug: string, locale: string) {
    return useQuery({
        queryKey: blogKeys.post(slug, locale),
        queryFn: () => fetchBlogPostClient(slug, locale),
        staleTime: 30 * 1000,
        enabled: !!slug,
    });
}

export function useBlogCategories() {
    return useQuery({
        queryKey: blogKeys.categories(),
        queryFn: fetchBlogCategoriesClient,
        staleTime: 10 * 60 * 1000,
    });
}

// ── Server-side prefetch helpers (re-export for pages) ────────────────────────

export { getBlogCategories, getBlogPost, getBlogPosts };
