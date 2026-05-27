import type { AccordionItem } from '@/components/blocks/accordion.types';

export type Block = {
    type: string;
    data?: {
        heading?: string;
        items?: AccordionItem[];
        [key: string]: unknown;
    };
};
