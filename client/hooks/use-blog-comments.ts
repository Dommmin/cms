'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { blogKeys } from '@/hooks/use-blog';
import { apiGetPage, apiPost } from '@/lib/api';
import type { BlogComment, PaginatedResponse } from '@/types/api';

export function useBlogComments(slug: string) {
    return useQuery({
        queryKey: blogKeys.comments(slug),
        queryFn: (): Promise<PaginatedResponse<BlogComment>> =>
            apiGetPage<BlogComment>(`/blog/posts/${slug}/comments`),
    });
}

export function usePostBlogComment(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { body: string; parent_id?: number }) =>
            apiPost<BlogComment>(`/blog/posts/${slug}/comments`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: blogKeys.comments(slug),
            });
        },
    });
}

export function useBlogVote(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (vote: 'up' | 'down') =>
            apiPost<{
                votes_up: number;
                votes_down: number;
                user_vote: 'up' | 'down' | null;
            }>(`/blog/posts/${slug}/vote`, { vote }),
        onSuccess: () => {
            // Invalidate all blog post queries for this slug (all locales)
            queryClient.invalidateQueries({
                queryKey: ['blog', 'post', slug],
            });
        },
    });
}

export function useRecordBlogView(slug: string) {
    return useMutation({
        mutationFn: () =>
            apiPost<{ views_count: number }>(`/blog/posts/${slug}/view`),
    });
}
