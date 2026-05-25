import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlockRelation } from '../types';
import type {
    CanvasBlockPreviewProps,
    EditableTextProps,
    InlineButtonProps,
    InlineEditableField,
} from './canvas-block-preview.types';

const editableFields: InlineEditableField[] = [
    'title',
    'heading',
    'subtitle',
    'description',
    'primary_label',
    'secondary_label',
];

function getRelationByKey(
    relations: BlockRelation[] | undefined,
    key: string,
): BlockRelation | undefined {
    return relations?.find((relation) => relation.relation_key === key);
}

function getRelationsByKey(
    relations: BlockRelation[] | undefined,
    key: string,
): BlockRelation[] {
    return relations?.filter((relation) => relation.relation_key === key) ?? [];
}

function textValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function mediaUrl(relation: BlockRelation | undefined): string | null {
    const url = relation?.metadata?.url;

    return typeof url === 'string' ? url : null;
}

function placeholderRelations(count: number): (BlockRelation | null)[] {
    return Array.from({ length: count }, () => null);
}

function itemsValue(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter((item): item is Record<string, unknown> => {
              return item !== null && typeof item === 'object';
          })
        : [];
}

function stripHtml(html: unknown): string {
    if (typeof html !== 'string') return '';

    return html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function EditableText({
    as: Tag,
    field,
    value,
    className,
    placeholder,
    onInlineEdit,
}: EditableTextProps) {
    const currentValue = textValue(value);

    return (
        <Tag
            className={cn(
                'rounded-sm transition outline-none focus:bg-background/80 focus:ring-2 focus:ring-primary/40',
                !currentValue && 'text-muted-foreground/70',
                className,
            )}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            data-inline-field={field}
            aria-label={`Edit ${field.replace(/_/g, ' ')}`}
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onBlur={(event) => {
                const nextValue = event.currentTarget.textContent?.trim() ?? '';

                if (nextValue !== currentValue) {
                    onInlineEdit(field, nextValue);
                }
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    event.currentTarget.blur();
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.currentTarget.textContent = currentValue;
                    event.currentTarget.blur();
                }
            }}
        >
            {currentValue || placeholder}
        </Tag>
    );
}

function InlineButton({ field, value, onInlineEdit }: InlineButtonProps) {
    return (
        <EditableText
            as="span"
            field={field}
            value={value}
            placeholder={
                field === 'primary_label' ? 'Primary CTA' : 'Secondary CTA'
            }
            onInlineEdit={onInlineEdit}
            className={cn(
                'inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold',
                field === 'primary_label'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground',
            )}
        />
    );
}

function HeroBannerPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const background = mediaUrl(
        getRelationByKey(block.relations, 'background'),
    );

    return (
        <div className="relative flex min-h-[24rem] items-center overflow-hidden rounded-md bg-primary text-primary-foreground">
            {background ? (
                <img
                    src={background}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70" />
            )}
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-5 px-8 py-16 text-center">
                <EditableText
                    as="h1"
                    field="title"
                    value={cfg.title}
                    placeholder="Hero title"
                    onInlineEdit={onInlineEdit}
                    className="text-4xl font-bold md:text-5xl"
                />
                <EditableText
                    as="p"
                    field="subtitle"
                    value={cfg.subtitle}
                    placeholder="Hero subtitle"
                    onInlineEdit={onInlineEdit}
                    className="mx-auto max-w-2xl text-lg text-primary-foreground/90"
                />
            </div>
        </div>
    );
}

function RichTextPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const plainContent = stripHtml(cfg.content);

    return (
        <div className="rounded-md bg-background p-6 shadow-sm ring-1 ring-border">
            <EditableText
                as="h2"
                field="heading"
                value={cfg.heading ?? cfg.title}
                placeholder="Rich text heading"
                onInlineEdit={(field, value) => {
                    onInlineEdit(
                        cfg.heading === undefined ? 'title' : field,
                        value,
                    );
                }}
                className="mb-3 text-2xl font-semibold"
            />
            <p className="max-w-none text-sm leading-7 text-muted-foreground">
                {plainContent || 'Rich text content appears here.'}
            </p>
        </div>
    );
}

function CallToActionPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;

    return (
        <div className="rounded-lg bg-foreground px-8 py-14 text-background">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
                <EditableText
                    as="h2"
                    field="title"
                    value={cfg.title}
                    placeholder="Call to action title"
                    onInlineEdit={onInlineEdit}
                    className="text-3xl font-bold"
                />
                <EditableText
                    as="p"
                    field="subtitle"
                    value={cfg.subtitle ?? cfg.description}
                    placeholder="CTA supporting text"
                    onInlineEdit={(field, value) => {
                        onInlineEdit(
                            cfg.subtitle === undefined ? 'description' : field,
                            value,
                        );
                    }}
                    className="max-w-2xl text-background/75"
                />
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                    <InlineButton
                        field="primary_label"
                        value={cfg.primary_label}
                        onInlineEdit={onInlineEdit}
                    />
                    <InlineButton
                        field="secondary_label"
                        value={cfg.secondary_label}
                        onInlineEdit={onInlineEdit}
                    />
                </div>
            </div>
        </div>
    );
}

function ImageGalleryPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const images = getRelationsByKey(block.relations, 'images').slice(0, 6);
    const galleryItems = images.length > 0 ? images : placeholderRelations(6);

    return (
        <div className="space-y-5">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Gallery title"
                onInlineEdit={onInlineEdit}
                className="text-2xl font-semibold"
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {galleryItems.map((relation, index) => {
                    const url = relation ? mediaUrl(relation) : null;

                    return (
                        <div
                            key={relation?.id ?? index}
                            className="aspect-square overflow-hidden rounded-md bg-muted"
                        >
                            {url ? (
                                <img
                                    src={url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                    Image
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function FeaturedProductsPreview({
    block,
    onInlineEdit,
}: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const products = getRelationsByKey(block.relations, 'products').slice(0, 4);
    const productItems =
        products.length > 0 ? products : placeholderRelations(4);

    return (
        <div className="space-y-5">
            <div className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                    <EditableText
                        as="h2"
                        field="title"
                        value={cfg.title}
                        placeholder="Featured products"
                        onInlineEdit={onInlineEdit}
                        className="text-2xl font-semibold"
                    />
                    <EditableText
                        as="p"
                        field="subtitle"
                        value={cfg.subtitle}
                        placeholder="Products subtitle"
                        onInlineEdit={onInlineEdit}
                        className="text-sm text-muted-foreground"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {productItems.map((relation, index) => {
                    const metadata = relation?.metadata ?? null;
                    const productName =
                        typeof metadata?.name === 'string'
                            ? metadata.name
                            : `Product ${index + 1}`;
                    const imageUrl =
                        typeof metadata?.image === 'string'
                            ? metadata.image
                            : null;

                    return (
                        <div
                            key={relation?.id ?? index}
                            className="overflow-hidden rounded-md border bg-background"
                        >
                            <div className="aspect-square bg-muted">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="space-y-2 p-3">
                                <p className="text-sm font-medium">
                                    {productName}
                                </p>
                                <div className="h-3 w-20 rounded bg-muted" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PromotionalBannerPreview({
    block,
    onInlineEdit,
}: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const background = mediaUrl(
        getRelationByKey(block.relations, 'background'),
    );

    return (
        <div className="relative overflow-hidden rounded-lg bg-primary px-8 py-12 text-primary-foreground">
            {background ? (
                <img
                    src={background}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : null}
            <div className="absolute inset-0 bg-primary/80" />
            <div className="relative z-10 flex max-w-2xl flex-col gap-4">
                <EditableText
                    as="h2"
                    field="title"
                    value={cfg.title}
                    placeholder="Promotional banner title"
                    onInlineEdit={onInlineEdit}
                    className="text-3xl font-bold"
                />
                <EditableText
                    as="p"
                    field="subtitle"
                    value={cfg.subtitle ?? cfg.description}
                    placeholder="Promotional banner copy"
                    onInlineEdit={(field, value) => {
                        onInlineEdit(
                            cfg.subtitle === undefined ? 'description' : field,
                            value,
                        );
                    }}
                    className="text-primary-foreground/85"
                />
            </div>
        </div>
    );
}

function NewsletterSignupPreview({
    block,
    onInlineEdit,
}: CanvasBlockPreviewProps) {
    const cfg = block.configuration;

    return (
        <div className="rounded-lg border bg-background px-8 py-10 text-center">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
                <EditableText
                    as="h2"
                    field="title"
                    value={cfg.title}
                    placeholder="Newsletter title"
                    onInlineEdit={onInlineEdit}
                    className="text-2xl font-semibold"
                />
                <EditableText
                    as="p"
                    field="subtitle"
                    value={cfg.subtitle ?? cfg.description}
                    placeholder="Newsletter supporting copy"
                    onInlineEdit={(field, value) => {
                        onInlineEdit(
                            cfg.subtitle === undefined ? 'description' : field,
                            value,
                        );
                    }}
                    className="text-sm text-muted-foreground"
                />
                <div className="mt-2 flex w-full max-w-md gap-2">
                    <div className="h-10 flex-1 rounded-md border bg-muted" />
                    <div className="h-10 w-28 rounded-md bg-primary" />
                </div>
            </div>
        </div>
    );
}

function TestimonialsPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const items = itemsValue(cfg.items).slice(0, 3);
    const testimonials =
        items.length > 0
            ? items
            : [
                  {
                      author: 'Customer name',
                      quote: 'Customer quote appears here.',
                  },
              ];

    return (
        <div className="space-y-5">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Testimonials"
                onInlineEdit={onInlineEdit}
                className="text-center text-2xl font-semibold"
            />
            <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-lg border bg-background p-5 shadow-sm"
                    >
                        <p className="text-sm leading-6 text-muted-foreground">
                            “{textValue(item.quote)}”
                        </p>
                        <p className="mt-4 text-sm font-semibold">
                            {textValue(item.author)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AccordionPreview({ block }: CanvasBlockPreviewProps) {
    const items = itemsValue(block.configuration.items).slice(0, 4);
    const accordionItems =
        items.length > 0
            ? items
            : [{ content: 'Answer appears here.', title: 'Question' }];

    return (
        <div className="rounded-lg border bg-background">
            {accordionItems.map((item, index) => (
                <div key={index} className="border-b px-5 py-4 last:border-b-0">
                    <p className="font-medium">{textValue(item.title)}</p>
                    {index === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                            {stripHtml(item.content)}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

function TabsPreview({ block }: CanvasBlockPreviewProps) {
    const tabs = itemsValue(block.configuration.tabs).slice(0, 4);
    const tabItems =
        tabs.length > 0
            ? tabs
            : [{ content: 'Tab content appears here.', title: 'Tab' }];

    return (
        <div className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex flex-wrap gap-2">
                {tabItems.map((tab, index) => (
                    <span
                        key={index}
                        className={cn(
                            'rounded-md px-3 py-2 text-sm font-medium',
                            index === 0
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground',
                        )}
                    >
                        {textValue(tab.title)}
                    </span>
                ))}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
                {stripHtml(tabItems[0]?.content)}
            </p>
        </div>
    );
}

function StatsCounterPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const stats = itemsValue(cfg.stats).slice(0, 4);
    const statItems =
        stats.length > 0 ? stats : [{ label: 'Metric', value: '100' }];

    return (
        <div className="space-y-6">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Stats title"
                onInlineEdit={onInlineEdit}
                className="text-center text-2xl font-semibold"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((stat, index) => (
                    <div
                        key={index}
                        className="rounded-lg border bg-background p-5 text-center"
                    >
                        <p className="text-3xl font-bold text-primary">
                            {textValue(stat.value)}
                            {textValue(stat.suffix)}
                        </p>
                        <p className="mt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {textValue(stat.label)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AlertBannerPreview({ block }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;

    return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-blue-900">
            <p className="text-sm font-medium">
                {textValue(cfg.message) || 'Important message'}
            </p>
        </div>
    );
}

function PricingPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const plans = itemsValue(cfg.plans).slice(0, 3);
    const planItems =
        plans.length > 0
            ? plans
            : [{ features: ['Feature'], name: 'Starter', price: '$10' }];

    return (
        <div className="space-y-6">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Pricing"
                onInlineEdit={onInlineEdit}
                className="text-center text-2xl font-semibold"
            />
            <div className="grid gap-4 md:grid-cols-3">
                {planItems.map((plan, index) => (
                    <div
                        key={index}
                        className="rounded-lg border bg-background p-5 shadow-sm"
                    >
                        <p className="font-semibold">{textValue(plan.name)}</p>
                        <p className="mt-3 text-3xl font-bold">
                            {textValue(plan.price) ||
                                textValue(plan.price_monthly)}
                        </p>
                        <div className="mt-4 h-9 rounded-md bg-primary" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function CategoriesGridPreview({
    block,
    onInlineEdit,
}: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const categories = getRelationsByKey(block.relations, 'categories').slice(
        0,
        6,
    );
    const items = categories.length > 0 ? categories : placeholderRelations(6);

    return (
        <div className="space-y-5">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Categories"
                onInlineEdit={onInlineEdit}
                className="text-2xl font-semibold"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((relation, index) => {
                    const metadata = relation?.metadata ?? null;
                    const name =
                        typeof metadata?.name === 'string'
                            ? metadata.name
                            : `Category ${index + 1}`;
                    const imageUrl = mediaUrl(relation ?? undefined);

                    return (
                        <div
                            key={relation?.id ?? index}
                            className="relative flex aspect-[4/3] items-end overflow-hidden rounded-lg bg-muted p-4"
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : null}
                            <div className="absolute inset-0 bg-black/20" />
                            <p className="relative z-10 rounded bg-background/90 px-3 py-2 text-sm font-semibold">
                                {name}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TwoColumnsPreview({ block }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
                <h3 className="text-xl font-semibold">
                    {textValue(cfg.left_title) || 'Left column'}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {stripHtml(cfg.left_content) || 'Left content'}
                </p>
            </div>
            <div className="rounded-lg border bg-background p-5">
                <h3 className="text-xl font-semibold">
                    {textValue(cfg.right_title) || 'Right column'}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {stripHtml(cfg.right_content) || 'Right content'}
                </p>
            </div>
        </div>
    );
}

function ThreeColumnsPreview({ block }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const columns = [
        {
            content: cfg.column_1_content,
            title: cfg.column_1_title,
        },
        {
            content: cfg.column_2_content,
            title: cfg.column_2_title,
        },
        {
            content: cfg.column_3_content,
            title: cfg.column_3_title,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {columns.map((column, index) => (
                <div
                    key={index}
                    className="rounded-lg border bg-background p-5"
                >
                    <h3 className="font-semibold">
                        {textValue(column.title) || `Column ${index + 1}`}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {stripHtml(column.content) || 'Column content'}
                    </p>
                </div>
            ))}
        </div>
    );
}

function FormEmbedPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const form =
        cfg.form && typeof cfg.form === 'object'
            ? (cfg.form as Record<string, unknown>)
            : null;
    const fields = itemsValue(form?.fields).slice(0, 4);

    return (
        <div className="rounded-lg border bg-background p-6">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Form title"
                onInlineEdit={onInlineEdit}
                className="text-2xl font-semibold"
            />
            <div className="mt-5 space-y-3">
                {(fields.length > 0
                    ? fields
                    : [{ label: 'Email address' }]
                ).map((field, index) => (
                    <div key={index}>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                            {textValue(field.label) || `Field ${index + 1}`}
                        </p>
                        <div className="h-10 rounded-md border bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function MapPreview({ block }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;

    return (
        <div className="overflow-hidden rounded-lg border bg-muted">
            {cfg.title ? (
                <h2 className="bg-background px-5 py-4 text-xl font-semibold">
                    {textValue(cfg.title)}
                </h2>
            ) : null}
            <div className="flex h-64 items-center justify-center bg-[linear-gradient(90deg,var(--muted)_24px,transparent_1px),linear-gradient(var(--muted)_24px,transparent_1px)] bg-[length:48px_48px]">
                <div className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    Map location
                </div>
            </div>
        </div>
    );
}

function FeaturedPostsPreview({
    block,
    onInlineEdit,
}: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const posts = getRelationsByKey(block.relations, 'posts').slice(0, 3);
    const items = posts.length > 0 ? posts : placeholderRelations(3);

    return (
        <div className="space-y-5">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Featured posts"
                onInlineEdit={onInlineEdit}
                className="text-2xl font-semibold"
            />
            <div className="grid gap-4 md:grid-cols-3">
                {items.map((relation, index) => {
                    const metadata = relation?.metadata ?? null;
                    const title =
                        typeof metadata?.title === 'string'
                            ? metadata.title
                            : `Post ${index + 1}`;

                    return (
                        <article
                            key={relation?.id ?? index}
                            className="rounded-lg border bg-background p-5"
                        >
                            <div className="mb-4 aspect-video rounded bg-muted" />
                            <h3 className="font-semibold">{title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Blog excerpt preview.
                            </p>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}

function LogoStripPreview({
    block,
    onInlineEdit,
    relationKey,
}: CanvasBlockPreviewProps & { relationKey: string }) {
    const cfg = block.configuration;
    const relations = getRelationsByKey(block.relations, relationKey).slice(
        0,
        6,
    );
    const items = relations.length > 0 ? relations : placeholderRelations(6);

    return (
        <div className="space-y-5">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Logo group"
                onInlineEdit={onInlineEdit}
                className="text-center text-xl font-semibold"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                {items.map((relation, index) => {
                    const metadata = relation?.metadata ?? null;
                    const name =
                        typeof metadata?.name === 'string'
                            ? metadata.name
                            : `Logo ${index + 1}`;
                    const imageUrl = mediaUrl(relation ?? undefined);

                    return (
                        <div
                            key={relation?.id ?? index}
                            className="flex h-20 items-center justify-center rounded-lg border bg-background p-3 text-center text-xs font-semibold text-muted-foreground"
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt=""
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                name
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CountdownPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;

    return (
        <div className="rounded-lg bg-foreground px-8 py-10 text-center text-background">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Countdown title"
                onInlineEdit={onInlineEdit}
                className="text-2xl font-semibold"
            />
            <div className="mt-6 grid grid-cols-4 gap-3">
                {['Days', 'Hours', 'Minutes', 'Seconds'].map((label) => (
                    <div
                        key={label}
                        className="rounded-lg bg-background/10 p-4"
                    >
                        <p className="text-3xl font-bold">00</p>
                        <p className="mt-1 text-xs tracking-wide uppercase">
                            {label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TimelinePreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const items = itemsValue(cfg.items).slice(0, 4);
    const timelineItems =
        items.length > 0
            ? items
            : [
                  {
                      date: '2026',
                      description: 'Milestone copy',
                      title: 'Milestone',
                  },
              ];

    return (
        <div className="space-y-6">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Timeline"
                onInlineEdit={onInlineEdit}
                className="text-center text-2xl font-semibold"
            />
            <div className="space-y-5 border-l-2 border-border pl-6">
                {timelineItems.map((item, index) => (
                    <div key={index} className="relative">
                        <span className="absolute top-1 -left-[31px] h-3 w-3 rounded-full bg-primary" />
                        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                            {textValue(item.date)}
                        </p>
                        <h3 className="mt-1 font-semibold">
                            {textValue(item.title)}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {textValue(item.description)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeamMembersPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const members = itemsValue(cfg.members).slice(0, 4);
    const teamMembers =
        members.length > 0 ? members : [{ name: 'Team member', role: 'Role' }];

    return (
        <div className="space-y-6">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Team"
                onInlineEdit={onInlineEdit}
                className="text-center text-2xl font-semibold"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((member, index) => (
                    <div
                        key={index}
                        className="rounded-lg border bg-background p-5 text-center"
                    >
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                            {textValue(member.name).slice(0, 1) || 'T'}
                        </div>
                        <p className="font-semibold">
                            {textValue(member.name)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {textValue(member.role)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function IconListPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const items = itemsValue(cfg.items).slice(0, 6);
    const iconItems =
        items.length > 0
            ? items
            : [{ description: 'Description', title: 'Feature' }];

    return (
        <div className="space-y-6">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Icon list"
                onInlineEdit={onInlineEdit}
                className="text-center text-2xl font-semibold"
            />
            <div className="grid gap-4 md:grid-cols-2">
                {iconItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex gap-4 rounded-lg border bg-background p-4"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                            +
                        </span>
                        <div>
                            <p className="font-semibold">
                                {textValue(item.title)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {textValue(item.description) ||
                                    textValue(item.text)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StepsProcessPreview({ block, onInlineEdit }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;
    const steps = itemsValue(cfg.steps).slice(0, 4);
    const stepItems =
        steps.length > 0
            ? steps
            : [{ description: 'Step description', title: 'Step' }];

    return (
        <div className="space-y-6">
            <EditableText
                as="h2"
                field="title"
                value={cfg.title}
                placeholder="Process"
                onInlineEdit={onInlineEdit}
                className="text-center text-2xl font-semibold"
            />
            <div className="grid gap-4 md:grid-cols-4">
                {stepItems.map((step, index) => (
                    <div key={index} className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                            {index + 1}
                        </div>
                        <p className="font-semibold">{textValue(step.title)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {textValue(step.description)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrustBadgesPreview({ block }: CanvasBlockPreviewProps) {
    const badges = itemsValue(block.configuration.badges).slice(0, 4);
    const badgeItems =
        badges.length > 0 ? badges : [{ label: 'Secure checkout' }];

    return (
        <div className="flex flex-wrap justify-center gap-4">
            {badgeItems.map((badge, index) => (
                <div
                    key={index}
                    className="rounded-lg border bg-background px-5 py-4 text-center"
                >
                    <p className="font-semibold">{textValue(badge.label)}</p>
                    {badge.sublabel ? (
                        <p className="text-sm text-muted-foreground">
                            {textValue(badge.sublabel)}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

function VideoEmbedPreview({ block }: CanvasBlockPreviewProps) {
    const cfg = block.configuration;

    return (
        <div className="overflow-hidden rounded-lg border bg-background">
            <div className="flex aspect-video items-center justify-center bg-foreground text-background">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/20 text-2xl">
                    Play
                </div>
            </div>
            <div className="p-4">
                <p className="font-semibold">
                    {textValue(cfg.title) || 'Video embed'}
                </p>
                <p className="text-sm text-muted-foreground">
                    {textValue(cfg.url) || 'Video URL'}
                </p>
            </div>
        </div>
    );
}

function CustomHtmlPreview({ block }: CanvasBlockPreviewProps) {
    const html = stripHtml(block.configuration.html);

    return (
        <div className="rounded-lg border border-dashed bg-background p-5">
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Custom HTML
            </p>
            <p className="text-sm leading-6">
                {html || 'Custom HTML output appears here.'}
            </p>
        </div>
    );
}

function FallbackPreview({ block }: CanvasBlockPreviewProps) {
    const label = block.type.replace(/_/g, ' ');
    const visibleFields = editableFields
        .map((field) => textValue(block.configuration[field]))
        .filter(Boolean);

    return (
        <div className="rounded-md border border-dashed bg-background p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
                <Package className="h-4 w-4" />
                {label}
            </div>
            {visibleFields.length > 0 ? (
                <div className="space-y-1">
                    {visibleFields.map((value) => (
                        <p key={value} className="text-sm">
                            {value}
                        </p>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    This block does not have a visual canvas preview yet.
                </p>
            )}
        </div>
    );
}

export function CanvasBlockPreview(props: CanvasBlockPreviewProps) {
    if (props.block.type === 'hero_banner')
        return <HeroBannerPreview {...props} />;
    if (props.block.type === 'rich_text') return <RichTextPreview {...props} />;
    if (props.block.type === 'call_to_action') {
        return <CallToActionPreview {...props} />;
    }
    if (props.block.type === 'image_gallery') {
        return <ImageGalleryPreview {...props} />;
    }
    if (props.block.type === 'featured_products') {
        return <FeaturedProductsPreview {...props} />;
    }
    if (props.block.type === 'promotional_banner') {
        return <PromotionalBannerPreview {...props} />;
    }
    if (props.block.type === 'newsletter_signup') {
        return <NewsletterSignupPreview {...props} />;
    }
    if (props.block.type === 'testimonials') {
        return <TestimonialsPreview {...props} />;
    }
    if (props.block.type === 'accordion') {
        return <AccordionPreview {...props} />;
    }
    if (props.block.type === 'tabs') {
        return <TabsPreview {...props} />;
    }
    if (props.block.type === 'stats_counter') {
        return <StatsCounterPreview {...props} />;
    }
    if (props.block.type === 'alert_banner') {
        return <AlertBannerPreview {...props} />;
    }
    if (
        props.block.type === 'pricing_cards' ||
        props.block.type === 'pricing_table'
    ) {
        return <PricingPreview {...props} />;
    }
    if (props.block.type === 'categories_grid') {
        return <CategoriesGridPreview {...props} />;
    }
    if (props.block.type === 'two_columns') {
        return <TwoColumnsPreview {...props} />;
    }
    if (props.block.type === 'three_columns') {
        return <ThreeColumnsPreview {...props} />;
    }
    if (props.block.type === 'form_embed') {
        return <FormEmbedPreview {...props} />;
    }
    if (props.block.type === 'map') {
        return <MapPreview {...props} />;
    }
    if (props.block.type === 'featured_posts') {
        return <FeaturedPostsPreview {...props} />;
    }
    if (props.block.type === 'brands_slider') {
        return <LogoStripPreview {...props} relationKey="brands" />;
    }
    if (props.block.type === 'logo_cloud') {
        return <LogoStripPreview {...props} relationKey="logos" />;
    }
    if (props.block.type === 'countdown_timer') {
        return <CountdownPreview {...props} />;
    }
    if (props.block.type === 'timeline') {
        return <TimelinePreview {...props} />;
    }
    if (props.block.type === 'team_members') {
        return <TeamMembersPreview {...props} />;
    }
    if (props.block.type === 'icon_list') {
        return <IconListPreview {...props} />;
    }
    if (props.block.type === 'steps_process') {
        return <StepsProcessPreview {...props} />;
    }
    if (props.block.type === 'trust_badges') {
        return <TrustBadgesPreview {...props} />;
    }
    if (props.block.type === 'video_embed') {
        return <VideoEmbedPreview {...props} />;
    }
    if (props.block.type === 'custom_html') {
        return <CustomHtmlPreview {...props} />;
    }

    return <FallbackPreview {...props} />;
}
