import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
import { blogKeys } from '@/hooks/blog-keys';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { getServerQueryClient } from '@/lib/query-client';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const revalidate = 120;

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Articles, news and inspiration from our team.',
    alternates: generateAlternates('/blog'),
};

export default async function BlogPage({ searchParams }: PageProps) {
    const { page = '1', category, sort = '-created_at' } = await searchParams;
    const params = {
        page: Number(page),
        category,
        sort,
        locale: DEFAULT_LOCALE,
    };

    const queryClient = getServerQueryClient();
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: blogKeys.posts(params),
            queryFn: () => getBlogPosts(params),
        }),
        queryClient.prefetchQuery({
            queryKey: blogKeys.categories(),
            queryFn: () => getBlogCategories(),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BlogListClient params={params} />
        </HydrationBoundary>
    );
}
