import type { Metadata } from 'next';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Blog';
    const description =
        'Poradniki, aktualności i praktyczne artykuły eksperckie.';
    const alternates = generateAlternates('/blog', DEFAULT_LOCALE);

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

    return (
        <BlogListClient posts={posts} categories={categories} params={params} />
    );
}
