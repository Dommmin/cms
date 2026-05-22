import type { Metadata } from 'next';

import {
    generateBlogPostMetadata,
    generateBlogPostStaticParams,
    BlogPostPage as SharedBlogPostPage,
} from '@/app/_routes/blog-post-page';
import { getNonDefaultLocales, resolveLocale } from '@/lib/i18n-server';
import type { PageProps } from './page.types';

export const revalidate = 30;

export async function generateStaticParams() {
    return generateBlogPostStaticParams(await getNonDefaultLocales());
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = await resolveLocale(rawLocale);

    return generateBlogPostMetadata(slug, locale);
}

export default async function BlogPostPage({ params }: PageProps) {
    const { locale: rawLocale, slug } = await params;
    const locale = await resolveLocale(rawLocale);

    return <SharedBlogPostPage slug={slug} locale={locale} />;
}
