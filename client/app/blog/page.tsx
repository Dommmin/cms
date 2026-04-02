import type { Metadata } from 'next';

import { DEFAULT_LOCALE } from '@/lib/i18n';
import { generateAlternates } from '@/lib/seo';
import { BlogListView } from './_blog-list';
import type { PageProps } from './page.types';

export const revalidate = 600;

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Articles, news and inspiration from our team.',
    alternates: generateAlternates('/blog'),
};

export default async function BlogPage({ searchParams }: PageProps) {
    const { page = '1', category, sort } = await searchParams;
    return (
        <BlogListView
            locale={DEFAULT_LOCALE}
            page={page}
            category={category}
            sort={sort}
        />
    );
}
