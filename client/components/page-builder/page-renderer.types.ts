import type { Page } from '@/types/api';

export interface PageRendererProps {
    page: Page;
    searchParams?: { [key: string]: string | string[] | undefined };
    locale: string;
}
