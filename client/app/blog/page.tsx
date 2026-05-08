import type { Metadata } from 'next';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
import { DEFAULT_LOCALE } from '@/lib/i18n';
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

    const [posts, categories] = await Promise.all([
        getBlogPosts(params),
        getBlogCategories(),
    ]);

    return <BlogListClient posts={posts} categories={categories} params={params} />;
}
