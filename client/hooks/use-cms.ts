'use client';

import { useQuery } from '@tanstack/react-query';

import { apiGet, apiGetMany, apiGetPage } from '@/lib/api';
import type {
    BlogCategory,
    BlogPost,
    Brand,
    Category,
    Faq,
    Menu,
    Page,
    PaginatedResponse,
} from '@/types/api';

export function usePage(slug: string) {
    return useQuery({
        queryKey: ['pages', slug],
        queryFn: () => apiGet<Page>(`/pages/${slug}`),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
}

export function useMenu(location: string) {
    return useQuery({
        queryKey: ['menus', location],
        queryFn: () => apiGet<Menu>(`/menus/${location}`),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => apiGetMany<Category>('/categories'),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCategory(slug: string) {
    return useQuery({
        queryKey: ['categories', slug],
        queryFn: () => apiGet<Category>(`/categories/${slug}`),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
}

export function useBlogPosts(
    params: { page?: number; category?: string } = {},
) {
    return useQuery({
        queryKey: ['blog', 'posts', params],
        queryFn: (): Promise<PaginatedResponse<BlogPost>> =>
            apiGetPage<BlogPost>('/blog/posts', { params }),
    });
}

export function useBlogPost(slug: string) {
    return useQuery({
        queryKey: ['blog', 'posts', slug],
        queryFn: () => apiGet<BlogPost>(`/blog/posts/${slug}`),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
}

export function useBlogCategories() {
    return useQuery({
        queryKey: ['blog', 'categories'],
        queryFn: () => apiGetMany<BlogCategory>('/blog/categories'),
        staleTime: 10 * 60 * 1000,
    });
}

export function useBrands() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: () => apiGetMany<Brand>('/brands'),
        staleTime: 10 * 60 * 1000,
    });
}

export function useFaqs() {
    return useQuery({
        queryKey: ['faqs'],
        queryFn: () => apiGetMany<Faq>('/faqs'),
        staleTime: 10 * 60 * 1000,
    });
}
