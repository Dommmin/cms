import type { Faq, Page } from '@/types/api';
import type { ModuleRendererProps } from './module-renderer.types';

/**
 * Renders the content for module-type pages.
 * The API embeds module-specific data inside page.module_config
 * (e.g. rich-text HTML for 'content', FAQ items for 'faq').
 */

function ContentModule({ page }: { page: Page }) {
    const html =
        page.content ?? (page.module_config?.html as string | undefined);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-4xl font-bold tracking-tight">
                {page.title}
            </h1>
            {page.excerpt && (
                <p className="text-muted-foreground mb-8 text-lg">
                    {page.excerpt}
                </p>
            )}
            {html && (
                <div
                    className="prose prose-lg dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            )}
        </div>
    );
}

function FaqModule({ page }: { page: Page }) {
    const items = (page.module_config?.items as Faq[] | undefined) ?? [];

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-3xl font-bold">{page.title}</h1>
            <div className="divide-border border-border flex flex-col divide-y overflow-hidden rounded-xl border">
                {items.map((faq) => (
                    <details key={faq.id} className="group px-6 py-4">
                        <summary className="cursor-pointer font-medium marker:content-none">
                            <span className="flex items-center justify-between gap-4">
                                {faq.question}
                                <span className="shrink-0 transition-transform group-open:rotate-180">
                                    ▾
                                </span>
                            </span>
                        </summary>
                        <div
                            className="prose prose-sm dark:prose-invert mt-3"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                    </details>
                ))}
            </div>
        </div>
    );
}

export function ModuleRenderer({ page }: ModuleRendererProps) {
    switch (page.module_name) {
        case 'content':
            return <ContentModule page={page} />;
        case 'faq':
            return <FaqModule page={page} />;
        default:
            if (process.env.NODE_ENV === 'development') {
                return (
                    <div className="text-muted-foreground p-8 text-center">
                        Unknown module: <strong>{page.module_name}</strong>
                    </div>
                );
            }
            return null;
    }
}
