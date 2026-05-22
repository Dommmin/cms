import type { Metadata } from 'next';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
import { type Locale } from '@/lib/i18n';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const revalidate = 120;

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale: Locale =
        rawLocale === 'en' || rawLocale === 'pl' ? rawLocale : 'pl';
    const title = 'Blog';
    const description = 'Articles, news and practical expert guides.';
    const alternates = generateAlternates('/blog', locale);

    return {
        title,
        description,
        alternates,
        openGraph: {
            title,
            description,
            type: 'website',
            url:
                typeof alternates?.canonical === 'string'
                    ? alternates.canonical
                    : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
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

    return (
        <BlogListClient
            posts={posts}
            categories={categories}
            params={blogParams}
        />
    );
}
