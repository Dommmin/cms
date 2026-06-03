import type { getPage } from '@/api/cms';

export interface PageProps {
    params: Promise<{ locale: string; slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export type PageData = Awaited<ReturnType<typeof getPage>>;
