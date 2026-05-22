import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getBlogPost, getBlogPosts } from '@/api/cms';
import { getBlogPostMetadata } from '@/app/blog/_blog-metadata';
import { BlogPostClient } from '@/components/blog-post-client';
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n';
import type { PageProps } from './page.types';

export const revalidate = 30;

export async function generateStaticParams() {
    const nonDefaultLocales = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
    try {
        const params = await Promise.all(
            nonDefaultLocales.map(async (locale) => {
                const posts = await getBlogPosts({ per_page: 200, locale });

                return posts.data.map((post) => ({ locale, slug: post.slug }));
            }),
        );

        return params.flat();
    } catch {
        return [];
    }
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    try {
        const { locale, slug } = await params;
        return getBlogPostMetadata(slug, locale);
    } catch {
        return {};
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { locale, slug } = await params;

    let post;
    try {
        post = await getBlogPost(slug, locale);
    } catch {
        notFound();
    }

    const relatedPosts = post.category
        ? (
              await getBlogPosts({
                  per_page: 4,
                  category: post.category.slug,
                  locale,
              }).catch(() => ({ data: [] }))
          ).data.filter((relatedPost) => relatedPost.id !== post.id)
        : [];

    return (
        <BlogPostClient
            post={post}
            relatedPosts={relatedPosts}
            locale={locale}
        />
    );
}
