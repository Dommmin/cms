import { Head } from '@inertiajs/react';
import type React from 'react';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { Cfg, PagePreviewProps, PreviewBlock } from './page-preview.types';

// ─── Block preview components ─────────────────────────────────────────────────

function HeroBannerPreview({ cfg }: { cfg: Cfg }) {
    return (
        <div
            className="relative flex min-h-[420px] items-center justify-center bg-gradient-to-br from-slate-800 to-slate-600 px-8 py-16 text-white"
            style={{
                minHeight: cfg.min_height ? `${cfg.min_height}px` : undefined,
            }}
        >
            <div
                className="relative z-10"
                style={{
                    textAlign: ((cfg.text_alignment as string) ||
                        'center') as React.CSSProperties['textAlign'],
                }}
            >
                {cfg.title && (
                    <h1 className="mb-4 text-4xl leading-tight font-bold">
                        {cfg.title as string}
                    </h1>
                )}
                {cfg.subtitle && (
                    <p className="mb-8 max-w-2xl text-xl opacity-90">
                        {cfg.subtitle as string}
                    </p>
                )}
                {cfg.cta_text && (
                    <a
                        href={(cfg.cta_url as string) || '#'}
                        className="inline-block rounded-md bg-white px-7 py-3 text-sm font-semibold text-slate-800 hover:bg-white/90"
                    >
                        {cfg.cta_text as string}
                    </a>
                )}
            </div>
        </div>
    );
}

function RichTextPreview({ cfg }: { cfg: Cfg }) {
    const widthClass =
        cfg.max_width === 'narrow'
            ? 'max-w-xl'
            : cfg.max_width === 'wide'
              ? 'max-w-5xl'
              : cfg.max_width === 'full'
                ? 'max-w-none'
                : 'max-w-3xl';
    return (
        <div className={`mx-auto px-8 py-10 ${widthClass}`}>
            {cfg.content ? (
                <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: cfg.content as string }}
                />
            ) : (
                <p className="text-muted-foreground italic">
                    Rich text — no content yet.
                </p>
            )}
        </div>
    );
}

function TwoColumnsPreview({ cfg }: { cfg: Cfg }) {
    const ratioMap: Record<string, string> = {
        '60-40': 'grid-cols-[3fr_2fr]',
        '40-60': 'grid-cols-[2fr_3fr]',
        '70-30': 'grid-cols-[7fr_3fr]',
        '30-70': 'grid-cols-[3fr_7fr]',
        '50-50': 'grid-cols-2',
    };
    const gridClass =
        ratioMap[(cfg.ratio as string) || '50-50'] || 'grid-cols-2';

    return (
        <div className={`grid gap-8 px-8 py-10 ${gridClass}`}>
            <div className="prose prose-slate max-w-none">
                {cfg.left_content ? (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: cfg.left_content as string,
                        }}
                    />
                ) : (
                    <div className="h-24 rounded-lg bg-muted" />
                )}
            </div>
            <div className="prose prose-slate max-w-none">
                {cfg.right_content ? (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: cfg.right_content as string,
                        }}
                    />
                ) : (
                    <div className="h-24 rounded-lg bg-muted" />
                )}
            </div>
        </div>
    );
}

function ThreeColumnsPreview({ cfg }: { cfg: Cfg }) {
    const cols = [
        { title: cfg.column_1_title, content: cfg.column_1_content },
        { title: cfg.column_2_title, content: cfg.column_2_content },
        { title: cfg.column_3_title, content: cfg.column_3_content },
    ];
    return (
        <div className="grid grid-cols-3 gap-6 px-8 py-10">
            {cols.map((col, i) => (
                <div key={i} className="space-y-3">
                    {col.title && (
                        <h3 className="font-semibold">{col.title as string}</h3>
                    )}
                    {col.content ? (
                        <div
                            className="prose prose-slate max-w-none text-sm"
                            dangerouslySetInnerHTML={{
                                __html: col.content as string,
                            }}
                        />
                    ) : (
                        <div className="h-20 rounded-lg bg-muted" />
                    )}
                </div>
            ))}
        </div>
    );
}

function AccordionPreview({ cfg }: { cfg: Cfg }) {
    const items =
        (cfg.items as
            | Array<{ title?: string; content?: string }>
            | undefined) ?? [];
    return (
        <div className="mx-auto max-w-3xl px-8 py-10">
            {cfg.title && (
                <h2 className="mb-6 text-2xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            <div className="divide-y rounded-lg border">
                {items.length > 0 ? (
                    items.map((item, i) => (
                        <details key={i} className="group px-5 py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                                {item.title || `Item ${i + 1}`}
                                <span className="text-muted-foreground">▾</span>
                            </summary>
                            {item.content && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {item.content}
                                </p>
                            )}
                        </details>
                    ))
                ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                        No items added yet
                    </div>
                )}
            </div>
        </div>
    );
}

function TabsPreview({ cfg }: { cfg: Cfg }) {
    const tabs =
        (cfg.tabs as Array<{ title?: string; content?: string }> | undefined) ??
        [];
    return (
        <div className="px-8 py-10">
            {/* Tab headers */}
            <div className="mb-6 flex gap-1 border-b">
                {tabs.map((tab, i) => (
                    <div
                        key={i}
                        className={`cursor-pointer px-4 py-2 text-sm font-medium ${i === 0 ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    >
                        {tab.title || `Tab ${i + 1}`}
                    </div>
                ))}
                {tabs.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                        No tabs added yet
                    </div>
                )}
            </div>
            {/* First tab content */}
            {tabs[0]?.content ? (
                <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: tabs[0].content }}
                />
            ) : (
                <div className="h-20 rounded-lg bg-muted" />
            )}
        </div>
    );
}

function TestimonialsPreview({ cfg }: { cfg: Cfg }) {
    const items =
        (cfg.items as
            | Array<{
                  author?: string;
                  role?: string;
                  content?: string;
                  rating?: number;
              }>
            | undefined) ?? [];
    const showRating = cfg.show_rating !== false;

    return (
        <div className="px-8 py-12">
            {cfg.title && (
                <h2 className="mb-8 text-center text-2xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            {items.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="rounded-xl border bg-card p-6 shadow-sm"
                        >
                            {showRating && item.rating && (
                                <div className="mb-3 text-amber-400">
                                    {'★'.repeat(item.rating)}
                                    {'☆'.repeat(5 - item.rating)}
                                </div>
                            )}
                            {item.content && (
                                <p className="mb-4 text-sm text-muted-foreground">
                                    "{item.content}"
                                </p>
                            )}
                            <div>
                                {item.author && (
                                    <p className="text-sm font-semibold">
                                        {item.author}
                                    </p>
                                )}
                                {item.role && (
                                    <p className="text-xs text-muted-foreground">
                                        {item.role}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-40 rounded-xl border bg-muted/30"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function FeaturedProductsPreview({ cfg }: { cfg: Cfg }) {
    const count = Math.min(Number(cfg.max_items) || 4, 8);
    const cols = Number(cfg.items_per_row) || 4;
    return (
        <div className="px-8 py-10">
            {cfg.title && (
                <h2 className="mb-6 text-2xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            <div
                className={`grid gap-4`}
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: Math.min(count, cols) }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-4">
                        <div className="mb-3 aspect-square rounded-md bg-muted" />
                        <div className="mb-2 h-3 w-3/4 rounded bg-muted" />
                        {cfg.show_price !== false && (
                            <div className="h-3 w-1/3 rounded bg-muted" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CategoriesGridPreview({ cfg }: { cfg: Cfg }) {
    const cols = Number(cfg.columns) || 4;
    return (
        <div className="px-8 py-10">
            {cfg.title && (
                <h2 className="mb-6 text-2xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: cols }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4"
                    >
                        <div className="aspect-square w-full rounded-md bg-muted" />
                        {cfg.show_labels !== false && (
                            <div className="h-3 w-2/3 rounded bg-muted" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function PromotionalBannerPreview({ cfg }: { cfg: Cfg }) {
    const bg = (cfg.background_color as string) || '#1e293b';
    const fg = (cfg.text_color as string) || '#ffffff';
    return (
        <div
            className="px-8 py-14 text-center"
            style={{ backgroundColor: bg, color: fg }}
        >
            {cfg.title && (
                <h2 className="mb-2 text-3xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            {cfg.subtitle && (
                <p className="mb-2 text-lg opacity-90">
                    {cfg.subtitle as string}
                </p>
            )}
            {cfg.badge_text && (
                <span className="mb-4 inline-block rounded-full border border-current px-3 py-1 text-xs font-medium opacity-80">
                    {cfg.badge_text as string}
                </span>
            )}
            {cfg.link_text && (
                <div className="mt-5">
                    <span className="inline-block rounded-md border border-current px-6 py-2.5 text-sm font-medium">
                        {cfg.link_text as string}
                    </span>
                </div>
            )}
        </div>
    );
}

function NewsletterSignupPreview({ cfg }: { cfg: Cfg }) {
    const bg = (cfg.background_color as string) || undefined;
    return (
        <div className="px-8 py-12 text-center" style={{ backgroundColor: bg }}>
            {cfg.title && (
                <h2 className="mb-2 text-2xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            {typeof cfg.description === 'string' && cfg.description && (
                <p className="mb-6 text-muted-foreground">{cfg.description}</p>
            )}
            <div className="mx-auto flex max-w-md gap-2">
                <div className="flex-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                    {(cfg.placeholder_text as string) ||
                        'Enter your email address'}
                </div>
                <span className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    {(cfg.button_text as string) || 'Subscribe'}
                </span>
            </div>
        </div>
    );
}

function VideoEmbedPreview({ cfg }: { cfg: Cfg }) {
    const ratioMap: Record<string, string> = {
        '16:9': 'aspect-video',
        '4:3': 'aspect-[4/3]',
        '1:1': 'aspect-square',
        '9:16': 'aspect-[9/16]',
    };
    const aspectClass =
        ratioMap[(cfg.aspect_ratio as string) || '16:9'] || 'aspect-video';

    return (
        <div className="px-8 py-10">
            {cfg.title && (
                <h2 className="mb-4 text-xl font-semibold">
                    {cfg.title as string}
                </h2>
            )}
            <div
                className={`relative ${aspectClass} flex items-center justify-center overflow-hidden rounded-lg border bg-slate-900`}
            >
                {cfg.video_url ? (
                    <iframe
                        src={cfg.video_url as string}
                        className="h-full w-full"
                        allow="fullscreen"
                        title={(cfg.title as string) || 'Video'}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-white/60">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30">
                            <div className="ml-1 h-0 w-0 border-t-[10px] border-b-[10px] border-l-[18px] border-t-transparent border-b-transparent border-l-white/60" />
                        </div>
                        <span className="text-sm">Video Embed</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ImageGalleryPreview({ cfg }: { cfg: Cfg }) {
    const cols = Number(cfg.columns) || 3;
    return (
        <div className="px-8 py-10">
            {cfg.title && (
                <h2 className="mb-6 text-2xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            <div
                className="grid gap-3"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: cols * 2 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex aspect-square items-center justify-center rounded-lg bg-muted"
                    >
                        <span className="text-xs text-muted-foreground">
                            Image {i + 1}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CustomHtmlPreview({ cfg }: { cfg: Cfg }) {
    return (
        <div className="px-8 py-10">
            {cfg.html ? (
                <div dangerouslySetInnerHTML={{ __html: cfg.html as string }} />
            ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Custom HTML block (empty)
                </div>
            )}
        </div>
    );
}

function FormEmbedPreview({ cfg }: { cfg: Cfg }) {
    return (
        <div className="mx-auto max-w-2xl px-8 py-12">
            {cfg.title && (
                <h2 className="mb-2 text-2xl font-bold">
                    {cfg.title as string}
                </h2>
            )}
            {typeof cfg.description === 'string' && cfg.description && (
                <p className="mb-6 text-muted-foreground">{cfg.description}</p>
            )}
            <div className="rounded-xl border bg-muted/30 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl">📋</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    Form placeholder — actual form renders on the live site.
                </p>
            </div>
        </div>
    );
}

function GenericBlockPreview({ type }: { type: string }) {
    return (
        <div className="mx-8 my-4 rounded-lg border border-dashed bg-muted/20 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground capitalize">
                {type.replace(/_/g, ' ')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                Preview not available for this block type
            </p>
        </div>
    );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

function PageBlockPreview({ block }: { block: PreviewBlock }) {
    const c = block.configuration;
    switch (block.type) {
        case 'hero_banner':
            return <HeroBannerPreview cfg={c} />;
        case 'rich_text':
            return <RichTextPreview cfg={c} />;
        case 'two_columns':
            return <TwoColumnsPreview cfg={c} />;
        case 'three_columns':
            return <ThreeColumnsPreview cfg={c} />;
        case 'accordion':
            return <AccordionPreview cfg={c} />;
        case 'tabs':
            return <TabsPreview cfg={c} />;
        case 'testimonials':
            return <TestimonialsPreview cfg={c} />;
        case 'featured_products':
            return <FeaturedProductsPreview cfg={c} />;
        case 'categories_grid':
            return <CategoriesGridPreview cfg={c} />;
        case 'promotional_banner':
            return <PromotionalBannerPreview cfg={c} />;
        case 'newsletter_signup':
            return <NewsletterSignupPreview cfg={c} />;
        case 'video_embed':
            return <VideoEmbedPreview cfg={c} />;
        case 'image_gallery':
            return <ImageGalleryPreview cfg={c} />;
        case 'custom_html':
            return <CustomHtmlPreview cfg={c} />;
        case 'form_embed':
            return <FormEmbedPreview cfg={c} />;
        default:
            return <GenericBlockPreview type={block.type} />;
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PagePreview({ page, sections }: PagePreviewProps) {
    const pageTitle = resolveLocalizedText(page.title);

    return (
        <>
            <Head title={`Preview – ${pageTitle}`} />

            <div className="min-h-screen bg-background font-sans">
                {/* Preview banner */}
                <div className="sticky top-0 z-50 border-b bg-amber-50 px-6 py-2 text-center text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    <span className="font-semibold">Preview mode</span>
                    {' — '}
                    {pageTitle}
                    <span className="ml-1 text-amber-600 dark:text-amber-400">
                        /{page.slug}
                    </span>
                </div>

                {sections.length === 0 ? (
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <p className="text-lg font-medium">
                                No sections yet
                            </p>
                            <p className="text-sm">
                                Add sections and blocks in the builder, then
                                save.
                            </p>
                        </div>
                    </div>
                ) : (
                    sections.map((section) => (
                        <section
                            key={section.id}
                            data-section-type={section.section_type}
                            data-layout={section.layout}
                            data-variant={section.variant ?? undefined}
                        >
                            {section.blocks.map((block) => (
                                <PageBlockPreview
                                    key={block.id}
                                    block={block}
                                />
                            ))}
                        </section>
                    ))
                )}
            </div>
        </>
    );
}
