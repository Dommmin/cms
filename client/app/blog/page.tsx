import type { Metadata } from 'next';

import {
    BlogIndexPage,
    generateBlogIndexMetadata,
} from '@/app/_routes/blog-index-page';
import { getDefaultLocale } from '@/lib/i18n-server';
import type { PageProps } from './page.types';

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
    return generateBlogIndexMetadata(await getDefaultLocale());
}

export default async function BlogPage({ searchParams }: PageProps) {
    return (
        <BlogIndexPage
            locale={await getDefaultLocale()}
            searchParams={searchParams}
        />
    );
}
