'use client';

import { sanitizeHtml } from '@/lib/sanitize';
import { useState } from 'react';

import type {
    AccordionBlockProps,
    AccordionConfig,
} from './accordion-block.types';

export function AccordionBlock({ block }: AccordionBlockProps) {
    const cfg = block.configuration as AccordionConfig;
    const items = cfg.items ?? [];
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    function toggle(index: number) {
        setOpenItems((prev) => {
            const next = cfg.allow_multiple ? new Set(prev) : new Set<number>();
            if (prev.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }

    return (
        <div className="flex flex-col gap-6">
            {cfg.title && <h2 className="text-2xl font-bold">{cfg.title}</h2>}

            <div className="divide-border border-border flex flex-col divide-y overflow-hidden rounded-xl border">
                {items.map((item, i) => {
                    const isOpen = openItems.has(i);
                    return (
                        <div key={i}>
                            <button
                                onClick={() => toggle(i)}
                                className="hover:bg-muted/50 flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-medium transition-colors"
                                aria-expanded={isOpen}
                            >
                                <span>{item.question}</span>
                                <span
                                    className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                >
                                    ▾
                                </span>
                            </button>
                            {isOpen && (
                                <div className="border-border border-t px-6 py-4">
                                    <div
                                        className="prose prose-sm dark:prose-invert"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtml(item.answer),
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
