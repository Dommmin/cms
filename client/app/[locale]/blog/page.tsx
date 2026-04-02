import type { Metadata } from 'next';

import { BlogListView } from '@/app/blog/_blog-list';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const revalidate = 600;

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    return {
        title: 'Blog',
        description: 'Articles, news and inspiration from our team.',
        alternates: generateAlternates('/blog'),
    };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
    const { locale } = await params;
    const { page = '1', category, sort } = await searchParams;
    return (
        <BlogListView
            locale={locale}
            page={page}
            category={category}
            sort={sort}
        />
    );
}
