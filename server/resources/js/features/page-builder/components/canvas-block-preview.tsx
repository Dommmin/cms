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

    return <FallbackPreview {...props} />;
}
