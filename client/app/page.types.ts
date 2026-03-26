import type { getPage } from '@/api/cms';

export type PageData = Awaited<ReturnType<typeof getPage>>;
