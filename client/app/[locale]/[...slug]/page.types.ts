import type { getPage } from '@/api/cms';

export interface PageProps {
    params: Promise<{ locale: string; slug: string[] }>;
}

export type PageData = Awaited<ReturnType<typeof getPage>>;
