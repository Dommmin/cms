import type { Metadata } from 'next';

import { getBlogPosts } from '@/api/cms';
import { BlogPostView, getBlogPostMetadata } from '@/app/blog/_blog-post';
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const revalidate = 3600;

export async function generateStaticParams() {
    const nonDefaultLocales = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
    try {
        const posts = await getBlogPosts({ per_page: 200 });
        return nonDefaultLocales.flatMap((locale) =>
            posts.data.map((post) => ({ locale, slug: post.slug })),
        );
    } catch {
        return [];
    }
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    try {
        const { locale, slug } = await params;
        return {
            ...(await getBlogPostMetadata(slug, locale)),
            alternates: generateAlternates(`/blog/${slug}`),
        };
    } catch {
        return {};
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { locale, slug } = await params;
    return <BlogPostView slug={slug} locale={locale} />;
}
