import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getBlogPost, getBlogPosts } from '@/api/cms';
import { getBlogPostMetadata } from '@/app/blog/_blog-metadata';
import { BlogPostClient } from '@/components/blog-post-client';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const revalidate = 30;

export async function generateStaticParams() {
    try {
        const posts = await getBlogPosts({ per_page: 200 });
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
        return {
            ...(await getBlogPostMetadata(slug, DEFAULT_LOCALE)),
            alternates: generateAlternates(`/blog/${slug}`),
        };
    } catch {
        return {};
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;

    try {
        const post = await getBlogPost(slug, DEFAULT_LOCALE);
        return <BlogPostClient post={post} locale={DEFAULT_LOCALE} />;
    } catch {
        notFound();
    }
}
