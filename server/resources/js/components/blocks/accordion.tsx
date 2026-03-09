import React from 'react';

type AccordionItem = {
    title: string;
    content: string;
};

type Props = {
    heading?: string;
    items: AccordionItem[];
};

// Simple accessible accordion block
export default function AccordionBlock({ heading, items }: Props) {
    return (
        <section className="rounded-lg border bg-white p-4">
            {heading && (
                <h3 className="mb-3 text-lg font-medium text-gray-900">
                    {heading}
                </h3>
            )}
            <div
                className="space-y-2"
                role="group"
                aria-label={heading ?? 'Accordion'}
            >
                {items.map((it, idx) => (
                    <details key={idx} className="rounded-md border px-2">
                        <summary className="cursor-pointer list-none py-2 text-sm font-medium text-gray-800">
                            {it.title}
                        </summary>
                        <div
                            className="px-2 pb-2 text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: it.content }}
                        />
                    </details>
                ))}
            </div>
        </section>
    );
}
