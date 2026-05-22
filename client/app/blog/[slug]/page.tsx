import type { Metadata } from 'next';

import {
    BlogPostPage as SharedBlogPostPage,
    generateBlogPostMetadata,
    generateBlogPostStaticParams,
} from '@/app/_routes/blog-post-page';
import { getDefaultLocale } from '@/lib/i18n-server';
import type { PageProps } from './page.types';

export const revalidate = 30;

export async function generateStaticParams() {
    const params = await generateBlogPostStaticParams([
        await getDefaultLocale(),
    ]);

    return params.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;

    return generateBlogPostMetadata(slug, await getDefaultLocale());
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;

    return <SharedBlogPostPage slug={slug} locale={await getDefaultLocale()} />;
}
