import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
} from 'lexical';
import { $applyNodeReplacement, $getNodeByKey, DecoratorNode } from 'lexical';
import { AlignCenter, AlignLeft, AlignRight, Captions, LinkIcon, Maximize2, Pencil, Trash2 } from 'lucide-react';
import type { CSSProperties, JSX, KeyboardEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type {
    CreateImageNodePayload,
    ImageAlign,
    ImageComponentProps,
    ImageCropVariant,
    ImageFocalPoint,
    ImageFilters,
    ImageLayout,
    ImageLoading,
    ImageNodeState,
    ImageSizePreset,
    ImageWrap,
    SerializedImageNode,
} from './image-node.types';
import { getEditorLinkTarget, isAllowedEditorLinkUrl, normalizeEditorLinkUrl } from './lexical/link-url';

const WIDTH_PRESETS: Array<{ label: string; preset: ImageSizePreset; width: string }> = [
    { label: 'S', preset: 'small', width: '25%' },
    { label: 'M', preset: 'medium', width: '50%' },
    { label: 'L', preset: 'large', width: '75%' },
    { label: 'Full', preset: 'full', width: '100%' },
];

const DEFAULT_IMAGE_STATE: Omit<ImageNodeState, 'src' | 'altText'> = {
    width: undefined,
    align: 'none',
    mediaId: null,
    caption: null,
    credit: null,
    layout: 'block',
    wrap: 'none',
    sizePreset: 'custom',
    focalPoint: null,
    decorative: false,
    linkUrl: null,
    loading: 'lazy',
    filters: null,
    cropVariants: [],
    cropVariantId: null,
    cropVariant: null,
};

function normalizeImageState(payload: CreateImageNodePayload): ImageNodeState {
    return {
        ...DEFAULT_IMAGE_STATE,
        ...payload,
        mediaId: payload.mediaId ?? null,
        caption: payload.caption ?? null,
        credit: payload.credit ?? null,
        focalPoint: payload.focalPoint ?? null,
        linkUrl: payload.linkUrl ?? null,
        decorative: payload.decorative ?? false,
        loading: payload.loading ?? 'lazy',
        filters: payload.filters ?? null,
        cropVariants: payload.cropVariants ?? [],
        cropVariantId: payload.cropVariantId ?? null,
        cropVariant: payload.cropVariant ?? null,
    };
}

function parseBoolean(value: string | null): boolean {
    return value === 'true' || value === '1';
}

function parseNumber(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

function parseFocalPoint(value: string | null): ImageFocalPoint | null {
    if (!value) return null;

    try {
        const decoded = JSON.parse(value) as Partial<ImageFocalPoint>;
        if (typeof decoded.x === 'number' && typeof decoded.y === 'number') {
            return { x: decoded.x, y: decoded.y };
        }
    } catch {
        return null;
    }

    return null;
}

function normalizeLinkUrl(value: string): string | null {
    const normalized = normalizeEditorLinkUrl(value);

    return isAllowedEditorLinkUrl(normalized) ? normalized : null;
}

function cssFilters(filters: ImageFilters | null): string | undefined {
    if (!filters) return undefined;
    const parts: string[] = [];
    if (filters.brightness !== undefined && filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
    if (filters.contrast !== undefined && filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
    if (filters.saturate !== undefined && filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
    if (filters.blur !== undefined && filters.blur > 0) parts.push(`blur(${filters.blur}px)`);

    return parts.length > 0 ? parts.join(' ') : undefined;
}

function imageObjectPosition(focalPoint: ImageFocalPoint | null): string | undefined {
    if (!focalPoint) return undefined;

    return `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%`;
}

function clampFocalPoint(value: number): number {
    if (!Number.isFinite(value)) {
        return 0.5;
    }

    return Math.min(1, Math.max(0, value));
}

function widthToPixels(widthValue: string | undefined, fallback: number): number {
    if (!widthValue) return fallback;
    if (widthValue.endsWith('px')) {
        const parsed = Number.parseInt(widthValue, 10);

        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

function updateNode(editor: LexicalEditor, nodeKey: NodeKey, changes: Partial<ImageNodeState>): void {
    editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
            node.update(changes);
        }
    });
}

function ImageComponent(props: ImageComponentProps): JSX.Element {
    const {
        src,
        altText,
        width,
        align,
        mediaId: _mediaId,
        caption,
        credit,
        layout,
        wrap,
        sizePreset,
        focalPoint,
        decorative,
        linkUrl,
        loading,
        filters,
        cropVariants,
        cropVariantId,
        nodeKey,
        editor,
    } = props;
    const imgRef = useRef<HTMLImageElement>(null);
    const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [isMetadataOpen, setIsMetadataOpen] = useState(false);
    const [localWidth, setLocalWidth] = useState<string | undefined>(width);
    const [draftAlt, setDraftAlt] = useState(altText);
    const [draftCaption, setDraftCaption] = useState(caption ?? '');
    const [draftCredit, setDraftCredit] = useState(credit ?? '');
    const [draftLinkUrl, setDraftLinkUrl] = useState(linkUrl ?? '');
    const [draftDecorative, setDraftDecorative] = useState(decorative);
    const [draftFocalX, setDraftFocalX] = useState(String(Math.round((focalPoint?.x ?? 0.5) * 100)));
    const [draftFocalY, setDraftFocalY] = useState(String(Math.round((focalPoint?.y ?? 0.5) * 100)));
    const [draftLoading, setDraftLoading] = useState<ImageLoading>(loading);
    const [draftFilters, setDraftFilters] = useState<ImageFilters | null>(filters);
    const [draftCropVariantId, setDraftCropVariantId] = useState(cropVariantId ? String(cropVariantId) : 'original');

    useEffect(() => {
        const syncId = setTimeout(() => {
            setLocalWidth(width);
            setDraftAlt(altText);
            setDraftCaption(caption ?? '');
            setDraftCredit(credit ?? '');
            setDraftLinkUrl(linkUrl ?? '');
            setDraftDecorative(decorative);
            setDraftFocalX(String(Math.round((focalPoint?.x ?? 0.5) * 100)));
            setDraftFocalY(String(Math.round((focalPoint?.y ?? 0.5) * 100)));
            setDraftLoading(loading);
            setDraftFilters(filters);
            setDraftCropVariantId(
                cropVariantId ? String(cropVariantId) : 'original',
            );
        }, 0);
        return () => clearTimeout(syncId);
    }, [altText, caption, credit, decorative, focalPoint, linkUrl, loading, width, filters, cropVariantId]);

    const applyWidth = (nextWidth: string, nextPreset: ImageSizePreset) => {
        setLocalWidth(nextWidth);
        updateNode(editor, nodeKey, { width: nextWidth, sizePreset: nextPreset });
    };

    const applyMetadata = () => {
        const safeLinkUrl = draftLinkUrl.trim() === '' ? null : normalizeLinkUrl(draftLinkUrl);
        const selectedCropVariant = cropVariants.find((variant: ImageCropVariant) => String(variant.id) === draftCropVariantId) ?? null;

        updateNode(editor, nodeKey, {
            ...(selectedCropVariant
                ? {
                    src: selectedCropVariant.url,
                    mediaId: selectedCropVariant.id,
                    cropVariantId: selectedCropVariant.id,
                    cropVariant: selectedCropVariant.variant,
                    focalPoint: selectedCropVariant.focalPoint ?? focalPoint,
                }
                : {
                    cropVariantId: null,
                    cropVariant: null,
                }),
            altText: draftDecorative ? '' : draftAlt,
            caption: draftCaption.trim() === '' ? null : draftCaption,
            credit: draftCredit.trim() === '' ? null : draftCredit,
            linkUrl: safeLinkUrl,
            decorative: draftDecorative,
            focalPoint: selectedCropVariant?.focalPoint ?? {
                x: clampFocalPoint(Number(draftFocalX) / 100),
                y: clampFocalPoint(Number(draftFocalY) / 100),
            },
            loading: draftLoading,
            filters: draftFilters && (draftFilters.brightness !== 100 || draftFilters.contrast !== 100 || draftFilters.saturate !== 100 || (draftFilters.blur ?? 0) > 0) ? draftFilters : null,
        });
        setIsMetadataOpen(false);
    };

    const resizeWithKeyboard = (event: KeyboardEvent<HTMLElement>) => {
        if (isSelected && (event.key === 'Delete' || event.key === 'Backspace')) {
            event.preventDefault();
            editor.update(() => $getNodeByKey(nodeKey)?.remove());
            return;
        }

        if (!isSelected || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
            return;
        }

        event.preventDefault();
        const currentWidth = widthToPixels(localWidth, imgRef.current?.offsetWidth ?? 300);
        const delta = event.shiftKey ? 25 : 10;
        const nextWidth = Math.max(80, currentWidth + (event.key === 'ArrowRight' ? delta : -delta));
        const nextWidthValue = `${nextWidth}px`;
        setLocalWidth(nextWidthValue);
        updateNode(editor, nodeKey, { width: nextWidthValue, sizePreset: 'custom' });
    };

    const startResize = (event: PointerEvent<HTMLElement>) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = imgRef.current?.offsetWidth ?? 300;
        const pointerId = event.pointerId;
        const target = event.currentTarget;
        dragRef.current = { startX, startWidth };
        target.setPointerCapture(pointerId);

        const onMove = (moveEvent: globalThis.PointerEvent) => {
            if (moveEvent.pointerId !== pointerId) return;
            if (!dragRef.current || !imgRef.current) return;
            const maxWidth = imgRef.current.parentElement?.clientWidth ?? 1200;
            const nextWidth = Math.min(maxWidth, Math.max(80, dragRef.current.startWidth + (moveEvent.clientX - dragRef.current.startX)));
            imgRef.current.style.width = `${nextWidth}px`;
        };

        const onUp = (upEvent: globalThis.PointerEvent) => {
            if (upEvent.pointerId !== pointerId) return;
            if (!dragRef.current) return;
            const maxWidth = imgRef.current?.parentElement?.clientWidth ?? 1200;
            const nextWidth = Math.min(maxWidth, Math.max(80, dragRef.current.startWidth + (upEvent.clientX - dragRef.current.startX)));
            const nextWidthValue = `${nextWidth}px`;
            setLocalWidth(nextWidthValue);
            updateNode(editor, nodeKey, { width: nextWidthValue, sizePreset: 'custom' });
            dragRef.current = null;
            if (target.hasPointerCapture(pointerId)) {
                target.releasePointerCapture(pointerId);
            }
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
    };

    const figureStyle: CSSProperties = {
        display: layout === 'inline' ? 'inline-block' : 'block',
        position: 'relative',
        maxWidth: '100%',
        marginBlock: '0.75rem',
    };

    if (layout === 'wide') {
        figureStyle.width = 'min(100%, 960px)';
    } else if (layout === 'full') {
        figureStyle.width = '100%';
    } else {
        figureStyle.width = localWidth ?? undefined;
    }

    if (wrap === 'wrap-left' || align === 'left') {
        figureStyle.float = 'left';
        figureStyle.marginRight = '1rem';
        figureStyle.maxWidth = 'min(100%, 50%)';
    } else if (wrap === 'wrap-right' || align === 'right') {
        figureStyle.float = 'right';
        figureStyle.marginLeft = '1rem';
        figureStyle.maxWidth = 'min(100%, 50%)';
    } else if (align === 'center' || layout === 'wide' || layout === 'full') {
        figureStyle.marginInline = 'auto';
    }

    const imageFilterStyle = cssFilters(filters);

    const imageElement = (
        <img
            ref={imgRef}
            src={src}
            alt={decorative ? '' : altText}
            loading={loading}
            style={{
                display: 'block',
                height: 'auto',
                width: layout === 'wide' || layout === 'full' ? '100%' : (localWidth ?? 'auto'),
                maxWidth: '100%',
                objectPosition: imageObjectPosition(focalPoint),
                filter: imageFilterStyle,
            }}
            draggable={false}
            className={`rounded-lg transition-shadow ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}`}
        />
    );

    return (
        <figure
            contentEditable={false}
            data-rte-image
            data-wrap={wrap}
            data-layout={layout}
            style={figureStyle}
            tabIndex={0}
            onClick={() => setIsSelected((selected) => !selected)}
            onKeyDown={resizeWithKeyboard}
        >
            {isSelected && (
                <span className="absolute top-2 left-2 z-20 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                    Image selected
                </span>
            )}
            {linkUrl ? (
                <a href={linkUrl} target={getEditorLinkTarget(linkUrl) ?? undefined} rel={getEditorLinkTarget(linkUrl) === '_blank' ? 'noopener noreferrer' : undefined}>
                    {imageElement}
                </a>
            ) : imageElement}

            {(caption || credit) && (
                <figcaption className="mt-1 text-center text-xs text-muted-foreground">
                    {caption}
                    {credit && <span className="block">Credit: {credit}</span>}
                </figcaption>
            )}

            {isSelected && (
                <>
                    <span className="absolute top-full left-1/2 z-20 mt-1 flex -translate-x-1/2 items-center gap-1 rounded-md border bg-popover px-1.5 py-1 text-xs shadow-lg">
                        {WIDTH_PRESETS.map((preset) => (
                            <button
                                key={preset.preset}
                                type="button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    applyWidth(preset.width, preset.preset);
                                }}
                                className={`rounded px-1.5 py-0.5 ${sizePreset === preset.preset ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                title={`Size ${preset.label}`}
                            >
                                {preset.label}
                            </button>
                        ))}
                        <span className="mx-0.5 h-4 w-px bg-border" />
                        {([
                            ['none', <AlignLeft key="none" size={13} />, 'No alignment'],
                            ['left', <AlignLeft key="left" size={13} />, 'Align left'],
                            ['center', <AlignCenter key="center" size={13} />, 'Center'],
                            ['right', <AlignRight key="right" size={13} />, 'Align right'],
                        ] as const).map(([nextAlign, icon, title]) => (
                            <button
                                key={nextAlign}
                                type="button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    updateNode(editor, nodeKey, { align: nextAlign, wrap: 'none' });
                                }}
                                className={`rounded p-1 ${align === nextAlign && wrap === 'none' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                title={title}
                            >
                                {icon}
                            </button>
                        ))}
                        <button
                            type="button"
                            onMouseDown={(event) => {
                                event.preventDefault();
                                updateNode(editor, nodeKey, { align: 'left', wrap: 'wrap-left', layout: 'block' });
                            }}
                            className={`rounded px-1.5 py-0.5 ${wrap === 'wrap-left' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            title="Wrap text right of image"
                        >
                            WL
                        </button>
                        <button
                            type="button"
                            onMouseDown={(event) => {
                                event.preventDefault();
                                updateNode(editor, nodeKey, { align: 'right', wrap: 'wrap-right', layout: 'block' });
                            }}
                            className={`rounded px-1.5 py-0.5 ${wrap === 'wrap-right' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            title="Wrap text left of image"
                        >
                            WR
                        </button>
                        <button
                            type="button"
                            onMouseDown={(event) => {
                                event.preventDefault();
                                updateNode(editor, nodeKey, { layout: layout === 'wide' ? 'block' : 'wide', wrap: 'none', align: 'center' });
                            }}
                            className={`rounded p-1 ${layout === 'wide' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            title="Wide image"
                        >
                            <Maximize2 size={13} />
                        </button>
                        {(['inline', 'block', 'full'] as const).map((nextLayout) => (
                            <button
                                key={nextLayout}
                                type="button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    updateNode(editor, nodeKey, {
                                        layout: nextLayout,
                                        wrap: 'none',
                                        align: nextLayout === 'inline' ? 'none' : 'center',
                                    });
                                }}
                                className={`rounded px-1.5 py-0.5 ${layout === nextLayout ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                title={`${nextLayout} image`}
                            >
                                {nextLayout === 'inline' ? 'In' : nextLayout === 'block' ? 'B' : 'FW'}
                            </button>
                        ))}
                        <button
                            type="button"
                            onMouseDown={(event) => {
                                event.preventDefault();
                                setIsMetadataOpen((open) => !open);
                            }}
                            className={`rounded p-1 ${isMetadataOpen ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            title="Edit image metadata"
                        >
                            <Pencil size={13} />
                        </button>
                        <button
                            type="button"
                            onMouseDown={(event) => {
                                event.preventDefault();
                                editor.update(() => $getNodeByKey(nodeKey)?.remove());
                            }}
                            className="rounded p-1 bg-muted text-destructive"
                            title="Remove image"
                        >
                            <Trash2 size={13} />
                            <span className="sr-only">Remove image</span>
                        </button>
                    </span>

                    {isMetadataOpen && (
                        <span className="absolute top-full left-1/2 z-30 mt-10 grid w-80 -translate-x-1/2 gap-2 rounded-md border bg-popover p-3 text-xs shadow-xl">
                            <label className="grid gap-1">
                                <span className="font-medium">Alt text</span>
                                <input
                                    value={draftAlt}
                                    disabled={draftDecorative}
                                    onChange={(event) => setDraftAlt(event.target.value)}
                                    className="h-8 rounded border bg-background px-2"
                                />
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={draftDecorative}
                                    onChange={(event) => setDraftDecorative(event.target.checked)}
                                />
                                Decorative image
                            </label>
                            <label className="grid gap-1">
                                <span className="font-medium">Caption</span>
                                <input value={draftCaption} onChange={(event) => setDraftCaption(event.target.value)} className="h-8 rounded border bg-background px-2" />
                            </label>
                            <label className="grid gap-1">
                                <span className="font-medium">Credit</span>
                                <input value={draftCredit} onChange={(event) => setDraftCredit(event.target.value)} className="h-8 rounded border bg-background px-2" />
                            </label>
                            <label className="grid gap-1">
                                <span className="font-medium">Image link</span>
                                <input value={draftLinkUrl} onChange={(event) => setDraftLinkUrl(event.target.value)} className="h-8 rounded border bg-background px-2" placeholder="https://, /relative or #anchor" />
                            </label>
                            {cropVariants.length > 0 && (
                                <label className="grid gap-1">
                                    <span className="font-medium">Crop variant</span>
                                    <select value={draftCropVariantId} onChange={(event) => setDraftCropVariantId(event.target.value)} className="h-8 rounded border bg-background px-2">
                                        <option value="original">Original</option>
                                        {cropVariants.map((variant: ImageCropVariant) => (
                                            <option key={variant.id} value={variant.id}>
                                                {variant.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <label className="grid gap-1">
                                    <span className="font-medium">Focal X (%)</span>
                                    <input type="number" min={0} max={100} value={draftFocalX} onChange={(event) => setDraftFocalX(event.target.value)} className="h-8 rounded border bg-background px-2" />
                                </label>
                                <label className="grid gap-1">
                                    <span className="font-medium">Focal Y (%)</span>
                                    <input type="number" min={0} max={100} value={draftFocalY} onChange={(event) => setDraftFocalY(event.target.value)} className="h-8 rounded border bg-background px-2" />
                                </label>
                            </div>
                            <label className="grid gap-1">
                                <span className="font-medium">Loading</span>
                                <select value={draftLoading} onChange={(event) => setDraftLoading(event.target.value as ImageLoading)} className="h-8 rounded border bg-background px-2">
                                    <option value="lazy">Lazy</option>
                                    <option value="eager">Eager</option>
                                </select>
                            </label>
                            <div className="grid gap-1">
                                <span className="font-medium">Filters</span>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-[11px]">
                                        <span className="w-20">Brightness</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={200}
                                            value={draftFilters?.brightness ?? 100}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, brightness: Number(e.target.value) }))}
                                            className="flex-1"
                                        />
                                        <span className="w-10 text-right">{draftFilters?.brightness ?? 100}%</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[11px]">
                                        <span className="w-20">Contrast</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={200}
                                            value={draftFilters?.contrast ?? 100}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, contrast: Number(e.target.value) }))}
                                            className="flex-1"
                                        />
                                        <span className="w-10 text-right">{draftFilters?.contrast ?? 100}%</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[11px]">
                                        <span className="w-20">Saturation</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={200}
                                            value={draftFilters?.saturate ?? 100}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, saturate: Number(e.target.value) }))}
                                            className="flex-1"
                                        />
                                        <span className="w-10 text-right">{draftFilters?.saturate ?? 100}%</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[11px]">
                                        <span className="w-20">Blur</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={10}
                                            step={0.5}
                                            value={draftFilters?.blur ?? 0}
                                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, blur: Number(e.target.value) }))}
                                            className="flex-1"
                                        />
                                        <span className="w-10 text-right">{draftFilters?.blur ?? 0}px</span>
                                    </label>
                                </div>
                            </div>
                            {!draftDecorative && draftAlt.trim() === '' && (
                                <span className="flex items-center gap-1 text-destructive">
                                    <Captions size={13} />
                                    Add alt text or mark this image as decorative.
                                </span>
                            )}
                            {draftLinkUrl.trim() !== '' && normalizeLinkUrl(draftLinkUrl) === null && (
                                <span className="flex items-center gap-1 text-destructive">
                                    <LinkIcon size={13} />
                                    Link must use https://, mailto:, tel:, /relative or #anchor.
                                </span>
                            )}
                            <span className="flex justify-end gap-2">
                                <button type="button" className="rounded border px-2 py-1" onClick={() => setIsMetadataOpen(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="rounded bg-primary px-2 py-1 text-primary-foreground disabled:opacity-50"
                                    disabled={!draftDecorative && draftAlt.trim() === ''}
                                    onClick={applyMetadata}
                                >
                                    Apply
                                </button>
                            </span>
                        </span>
                    )}

                    <button
                        type="button"
                        aria-label="Resize image"
                        contentEditable={false}
                        onPointerDown={startResize}
                        className="absolute -right-4 -bottom-4 z-10 flex h-8 w-8 touch-none items-center justify-center rounded-full"
                        style={{ cursor: 'nwse-resize' }}
                    >
                        <span className="h-4 w-4 rounded bg-primary" />
                    </button>
                </>
            )}
        </figure>
    );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
    __imageState: ImageNodeState;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode({ ...node.__imageState }, node.__key);
    }

    constructor(payload: CreateImageNodePayload, key?: NodeKey) {
        super(key);
        this.__imageState = normalizeImageState(payload);
    }

    static importJSON(serialized: SerializedImageNode): ImageNode {
        return $createImageNode({
            src: serialized.src,
            altText: serialized.altText,
            width: serialized.width,
            align: serialized.align,
            mediaId: serialized.mediaId,
            caption: serialized.caption,
            credit: serialized.credit,
            layout: serialized.layout,
            wrap: serialized.wrap,
            sizePreset: serialized.sizePreset,
            focalPoint: serialized.focalPoint,
            decorative: serialized.decorative,
            linkUrl: serialized.linkUrl,
            loading: serialized.loading,
            filters: serialized.filters,
            cropVariants: serialized.cropVariants,
            cropVariantId: serialized.cropVariantId,
            cropVariant: serialized.cropVariant,
        });
    }

    exportJSON(): SerializedImageNode {
        return {
            type: 'image',
            version: 2,
            ...this.__imageState,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            figure: (domNode: HTMLElement) => {
                if (!domNode.querySelector('img')) return null;

                return { conversion: convertFigureElement, priority: 2 };
            },
            img: () => ({
                conversion: convertImageElement,
                priority: 1,
            }),
        };
    }

    exportDOM(): DOMExportOutput {
        const state = this.__imageState;
        const figure = document.createElement('figure');
        figure.setAttribute('data-rte-image', 'true');
        figure.setAttribute('data-align', state.align);
        figure.setAttribute('data-layout', state.layout);
        figure.setAttribute('data-wrap', state.wrap);
        figure.setAttribute('data-size-preset', state.sizePreset);
        figure.setAttribute('data-decorative', String(state.decorative));
        if (state.mediaId !== null) figure.setAttribute('data-media-id', String(state.mediaId));
        if (state.credit) figure.setAttribute('data-credit', state.credit);
        if (state.focalPoint) figure.setAttribute('data-focal-point', JSON.stringify(state.focalPoint));
        if (state.cropVariant) figure.setAttribute('data-crop-variant', state.cropVariant);
        if (state.cropVariantId !== null) figure.setAttribute('data-crop-variant-id', String(state.cropVariantId));
        figure.className = `rte-image rte-image--${state.layout} rte-image--${state.wrap}`;
        figure.style.maxWidth = '100%';
        figure.style.marginBlock = '0.75rem';

        if (state.width && state.layout !== 'wide' && state.layout !== 'full') {
            figure.style.width = state.width;
        }
        if (state.wrap === 'wrap-left' || state.align === 'left') {
            figure.style.cssFloat = 'left';
            figure.style.marginRight = '1rem';
        } else if (state.wrap === 'wrap-right' || state.align === 'right') {
            figure.style.cssFloat = 'right';
            figure.style.marginLeft = '1rem';
        } else if (state.align === 'center' || state.layout === 'wide' || state.layout === 'full') {
            figure.style.marginInline = 'auto';
        }

        const img = document.createElement('img');
        img.setAttribute('src', state.src);
        img.setAttribute('alt', state.decorative ? '' : state.altText);
        img.setAttribute('loading', state.loading);
        img.setAttribute('class', 'rounded-lg');
        img.style.display = 'block';
        img.style.height = 'auto';
        img.style.maxWidth = '100%';
        img.style.width = state.layout === 'wide' || state.layout === 'full' ? '100%' : (state.width ?? 'auto');
        const objectPosition = imageObjectPosition(state.focalPoint);
        if (objectPosition) img.style.objectPosition = objectPosition;

        const imageFilter = cssFilters(state.filters);
        if (imageFilter) img.style.filter = imageFilter;

        const safeLinkUrl = state.linkUrl ? normalizeLinkUrl(state.linkUrl) : null;
        if (safeLinkUrl) {
            const link = document.createElement('a');
            link.setAttribute('href', safeLinkUrl);
            const target = getEditorLinkTarget(safeLinkUrl);
            if (target) link.setAttribute('target', target);
            if (target === '_blank') link.setAttribute('rel', 'noopener noreferrer');
            link.appendChild(img);
            figure.appendChild(link);
        } else {
            figure.appendChild(img);
        }

        if (state.caption || state.credit) {
            const figcaption = document.createElement('figcaption');
            if (state.caption) figcaption.append(state.caption);
            if (state.credit) {
                const credit = document.createElement('span');
                credit.setAttribute('data-credit', 'true');
                credit.textContent = state.credit;
                figcaption.append(credit);
            }
            figure.appendChild(figcaption);
        }

        return { element: figure };
    }

    createDOM(): HTMLElement {
        return document.createElement('span');
    }

    updateDOM(): false {
        return false;
    }

    isInline(): false {
        return false;
    }

    update(changes: Partial<ImageNodeState>): void {
        const writable = this.getWritable();
        writable.__imageState = { ...writable.__imageState, ...changes };
    }

    setWidth(width: string | undefined): void {
        this.update({ width });
    }

    setAlign(align: ImageAlign): void {
        this.update({ align });
    }

    decorate(editor: LexicalEditor, _config: EditorConfig): JSX.Element {
        return <ImageComponent {...this.__imageState} nodeKey={this.__key} editor={editor} />;
    }
}

function convertFigureElement(domNode: HTMLElement): DOMConversionOutput | null {
    const img = domNode.querySelector('img');
    if (!img) return null;
    const link = img.closest('a');
    const figcaption = domNode.querySelector('figcaption');
    const creditElement = figcaption?.querySelector('[data-credit]');

    return {
        node: $createImageNode({
            ...payloadFromImageElement(img),
            mediaId: parseNumber(domNode.getAttribute('data-media-id')),
            caption: figcaption?.childNodes[0]?.textContent?.trim() || null,
            credit: domNode.getAttribute('data-credit') ?? creditElement?.textContent ?? null,
            layout: (domNode.getAttribute('data-layout') as ImageLayout | null) ?? 'block',
            wrap: (domNode.getAttribute('data-wrap') as ImageWrap | null) ?? 'none',
            sizePreset: (domNode.getAttribute('data-size-preset') as ImageSizePreset | null) ?? 'custom',
            focalPoint: parseFocalPoint(domNode.getAttribute('data-focal-point')),
            decorative: parseBoolean(domNode.getAttribute('data-decorative')),
            linkUrl: link?.getAttribute('href') ?? null,
        }),
    };
}

function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
    const img = domNode as HTMLImageElement;
    const payload = payloadFromImageElement(img);

    if (!payload.src) return null;

    return { node: $createImageNode(payload) };
}

function payloadFromImageElement(img: HTMLImageElement): CreateImageNodePayload {
    const src = img.getAttribute('src') ?? '';
    const altText = img.getAttribute('alt') ?? '';
    const width = img.style.width || img.getAttribute('width') || undefined;
    const floatValue = img.style.float;
    const align: ImageAlign = floatValue === 'left' ? 'left' : floatValue === 'right' ? 'right' : 'none';
    const loading = img.getAttribute('loading') === 'eager' ? 'eager' : 'lazy';

    return {
        src,
        altText,
        width,
        align,
        wrap: align === 'left' ? 'wrap-left' : align === 'right' ? 'wrap-right' : 'none',
        decorative: altText === '',
        loading: loading as ImageLoading,
    };
}

export function $createImageNode(payload: CreateImageNodePayload): ImageNode {
    return $applyNodeReplacement(new ImageNode(payload));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}

export type {
    CreateImageNodePayload,
    ImageAlign,
    ImageCropVariant,
    ImageFocalPoint,
    ImageLayout,
    ImageLoading,
    ImageSizePreset,
    ImageWrap,
    SerializedImageNode,
};
