import type { Locale } from '@/lib/i18n';

export interface BlogIndexSearchParams {
    page?: string;
    category?: string;
    sort?: string;
}

export interface BlogPostParams {
    slug: string;
    locale: Locale;
}

export interface BlogIndexPageProps {
    locale: Locale;
    searchParams: Promise<BlogIndexSearchParams>;
}
