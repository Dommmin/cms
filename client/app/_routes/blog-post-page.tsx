import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getBlogPost, getBlogPosts } from '@/api/cms';
import { getBlogPostMetadata } from '@/app/blog/_blog-metadata';
import { BlogPostClient } from '@/components/blog-post-client';
import { type Locale } from '@/lib/i18n';

import type { BlogPostParams } from './blog.types';

export async function generateBlogPostStaticParams(
    locales: readonly Locale[],
): Promise<BlogPostParams[]> {
    try {
        const params = await Promise.all(
            locales.map(async (locale) => {
                const posts = await getBlogPosts({ per_page: 200, locale });

                return posts.data.map((post) => ({ locale, slug: post.slug }));
            }),
        );

        return params.flat();
    } catch {
        return [];
    }
}

export async function generateBlogPostMetadata(
    slug: string,
    locale: Locale,
): Promise<Metadata> {
    try {
        return getBlogPostMetadata(slug, locale);
    } catch {
        return {};
    }
}

export async function BlogPostPage({ slug, locale, basePath }: BlogPostParams) {
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
            basePath={basePath ?? '/blog'}
        />
    );
}
