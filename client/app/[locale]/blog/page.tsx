import type { Metadata } from 'next';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
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

    const [posts, categories] = await Promise.all([
        getBlogPosts(blogParams),
        getBlogCategories(),
    ]);

    return <BlogListClient posts={posts} categories={categories} params={blogParams} />;
}
