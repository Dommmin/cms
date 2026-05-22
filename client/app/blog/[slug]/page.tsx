import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getBlogPost, getBlogPosts } from '@/api/cms';
import { getBlogPostMetadata } from '@/app/blog/_blog-metadata';
import { BlogPostClient } from '@/components/blog-post-client';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import type { PageProps } from './page.types';

export const revalidate = 30;

export async function generateStaticParams() {
    try {
        const posts = await getBlogPosts({
            per_page: 200,
            locale: DEFAULT_LOCALE,
        });
        return posts.data.map((post) => ({ slug: post.slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    try {
        const { slug } = await params;
        return getBlogPostMetadata(slug, DEFAULT_LOCALE);
    } catch {
        return {};
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;

    let post;
    try {
        post = await getBlogPost(slug, DEFAULT_LOCALE);
    } catch {
        notFound();
    }

    const relatedPosts = post.category
        ? (
              await getBlogPosts({
                  per_page: 4,
                  category: post.category.slug,
                  locale: DEFAULT_LOCALE,
              }).catch(() => ({ data: [] }))
          ).data.filter((relatedPost) => relatedPost.id !== post.id)
        : [];

    return (
        <BlogPostClient
            post={post}
            relatedPosts={relatedPosts}
            locale={DEFAULT_LOCALE}
        />
    );
}
