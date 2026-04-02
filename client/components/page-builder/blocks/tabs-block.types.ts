import type { PageBlock } from '@/types/api';

export interface Tab {
    label: string;
    content?: string;
    icon?: string;
}
export interface TabsConfig {
    title?: string;
    tabs?: Tab[];
    variant?: 'underline' | 'pills' | 'boxed';
}
export interface TabsBlockProps {
    block: PageBlock;
}
