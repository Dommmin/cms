import type { Metadata } from 'next';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
import { type Locale } from '@/lib/i18n';
import { getI18nConfig } from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';

import type { BlogIndexPageProps } from './blog.types';

export async function generateBlogIndexMetadata(
    locale: Locale,
): Promise<Metadata> {
    const i18nConfig = await getI18nConfig();
    const title = 'Blog';
    const description =
        locale === 'pl'
            ? 'Poradniki, aktualności i praktyczne artykuły eksperckie.'
            : 'Articles, news and practical expert guides.';
    const alternates = generateAlternates('/blog', locale, i18nConfig);

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

export async function BlogIndexPage({
    locale,
    searchParams,
}: BlogIndexPageProps) {
    const { page = '1', category, sort = '-created_at' } = await searchParams;
    const params = {
        page: Number(page),
        category,
        sort,
        locale,
    };

    const [posts, categories] = await Promise.all([
        getBlogPosts(params),
        getBlogCategories(),
    ]);

    return (
        <BlogListClient posts={posts} categories={categories} params={params} />
    );
}
