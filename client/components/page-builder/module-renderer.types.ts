import type { Page } from '@/types/api';

export interface ModuleRendererProps {
    page: Page;
    searchParams?: { [key: string]: string | string[] | undefined };
    locale: string;
}
