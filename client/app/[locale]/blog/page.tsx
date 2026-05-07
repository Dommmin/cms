import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
import { blogKeys } from '@/hooks/blog-keys';
import { getServerQueryClient } from '@/lib/query-client';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const revalidate = 120;

export async function generateMetadata({}: PageProps): Promise<Metadata> {
    return {
        title: 'Blog',
        description: 'Articles, news and inspiration from our team.',
        alternates: generateAlternates('/blog'),
    };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
    const { locale } = await params;
    const { page = '1', category, sort = '-created_at' } = await searchParams;
    const blogParams = {
        page: Number(page),
        category,
        sort,
        locale,
    };

    const queryClient = getServerQueryClient();
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: blogKeys.posts(blogParams),
            queryFn: () => getBlogPosts(blogParams),
        }),
        queryClient.prefetchQuery({
            queryKey: blogKeys.categories(),
            queryFn: () => getBlogCategories(),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BlogListClient params={blogParams} />
        </HydrationBoundary>
    );
}
