import type { Metadata } from 'next';

import {
    BlogIndexPage,
    generateBlogIndexMetadata,
} from '@/app/_routes/blog-index-page';
import { resolveLocale } from '@/lib/i18n-server';
import type { PageProps } from './page.types';

export const revalidate = 120;

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = await resolveLocale(rawLocale);

    return generateBlogIndexMetadata(locale);
}

export default async function BlogPage({ params, searchParams }: PageProps) {
    const { locale: rawLocale } = await params;
    const locale = await resolveLocale(rawLocale);

    return <BlogIndexPage locale={locale} searchParams={searchParams} />;
}
