'use client';

import { sanitizeHtml } from '@/lib/sanitize';

import { BlockHeader } from '@/components/composition';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

import type {
    AccordionBlockProps,
    AccordionConfig,
} from './accordion-block.types';

export function AccordionBlock({ block }: AccordionBlockProps) {
    const cfg = block.configuration as AccordionConfig;
    const items = cfg.items ?? [];

    return (
        <div className="flex flex-col gap-6">
            <BlockHeader title={cfg.title} size="base" />

            <Accordion
                type={cfg.allow_multiple ? 'multiple' : 'single'}
                collapsible={!cfg.allow_multiple}
                className="border-border overflow-hidden rounded-xl border"
            >
                {items.map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="px-6">
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>
                            <div
                                className="prose prose-sm dark:prose-invert"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(item.answer),
                                }}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
