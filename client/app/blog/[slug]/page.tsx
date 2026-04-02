import type { Metadata } from 'next';

import { getBlogPosts } from '@/api/cms';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { generateAlternates } from '@/lib/seo';
import { BlogPostView, getBlogPostMetadata } from '../_blog-post';
import type { PageProps } from './page.types';

export const revalidate = 3600;

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
    return <BlogPostView slug={slug} locale={DEFAULT_LOCALE} />;
}
