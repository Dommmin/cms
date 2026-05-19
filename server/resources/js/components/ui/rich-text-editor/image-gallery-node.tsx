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
import { Plus, X } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { MediaPickerModal, type MediaItem } from '@/components/media-picker-modal';
import type { GalleryAspectRatio, GalleryGap, GalleryImage, ImageGalleryComponentProps, SerializedImageGalleryNode } from './image-gallery-node.types';

const GAP_VALUES: Record<GalleryGap, string> = {
    compact: '4px',
    normal: '8px',
    wide: '16px',
};

const ASPECT_RATIO_STYLES: Record<GalleryAspectRatio, string | undefined> = {
    square: '1 / 1',
    '4:3': '4 / 3',
    '16:9': '16 / 9',
    natural: undefined,
};

function galleryImageFromMedia(media: MediaItem): GalleryImage {
    return {
        mediaId: media.id,
        src: media.url,
        alt: media.alt || media.name,
        caption: media.caption ?? null,
        width: media.width ?? null,
        height: media.height ?? null,
        focalPoint: null,
    };
}

function ImageGalleryComponent({
    images,
    columns,
    mobileColumns,
    gap,
    aspectRatio,
    lightbox,
    nodeKey,
    editor,
}: ImageGalleryComponentProps) {
    const [showPicker, setShowPicker] = useState(false);

    const updateNode = (
        changes: Partial<{
            images: GalleryImage[];
            columns: number;
            mobileColumns: number;
            gap: GalleryGap;
            aspectRatio: GalleryAspectRatio;
            lightbox: boolean;
        }>,
    ) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageGalleryNode(node)) {
                node.update(changes);
            }
        });
    };

    const handleMediaSelect = (media: MediaItem) => {
        updateNode({ images: [...images, galleryImageFromMedia(media)] });
    };

    const removeImage = (index: number) => {
        updateNode({ images: images.filter((_, i) => i !== index) });
    };

    return (
        <div
            contentEditable={false}
            className="my-2 rounded-lg border-2 border-dashed border-border p-3"
            data-type="image-gallery"
        >
            <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Gallery</span>
                <div className="ml-auto flex flex-wrap items-center gap-1">
                    <span className="text-xs text-muted-foreground">Cols:</span>
                    {[2, 3, 4].map((col) => (
                        <button
                            key={col}
                            type="button"
                            onClick={() => updateNode({ columns: col })}
                            className={`rounded px-2 py-0.5 text-xs transition-colors ${
                                columns === col
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                            }`}
                        >
                            {col}
                        </button>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">Mobile:</span>
                    {[1, 2].map((col) => (
                        <button
                            key={col}
                            type="button"
                            onClick={() => updateNode({ mobileColumns: col })}
                            className={`rounded px-2 py-0.5 text-xs transition-colors ${mobileColumns === col ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                        >
                            {col}
                        </button>
                    ))}
                    <select value={gap} onChange={(event) => updateNode({ gap: event.target.value as GalleryGap })} className="h-7 rounded border bg-background px-1 text-xs">
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="wide">Wide</option>
                    </select>
                    <select value={aspectRatio} onChange={(event) => updateNode({ aspectRatio: event.target.value as GalleryAspectRatio })} className="h-7 rounded border bg-background px-1 text-xs">
                        <option value="square">Square</option>
                        <option value="4:3">4:3</option>
                        <option value="16:9">16:9</option>
                        <option value="natural">Natural</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={lightbox} onChange={(event) => updateNode({ lightbox: event.target.checked })} />
                        Lightbox
                    </label>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: GAP_VALUES[gap],
                }}
            >
                {images.map((img, i) => (
                    <div key={i} className="group relative">
                        <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full rounded object-cover"
                            style={{ aspectRatio: ASPECT_RATIO_STYLES[aspectRatio], height: aspectRatio === 'natural' ? 'auto' : undefined }}
                        />
                        {img.caption && (
                            <p className="mt-1 truncate text-[11px] text-muted-foreground">
                                {img.caption}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="flex h-32 flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Add image</span>
                </button>
            </div>

            <MediaPickerModal
                open={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={handleMediaSelect}
                selectedImages={[]}
                mode="gallery"
                multiple
            />
        </div>
    );
}

export class ImageGalleryNode extends DecoratorNode<JSX.Element> {
    __images: GalleryImage[];
    __columns: number;
    __mobileColumns: number;
    __gap: GalleryGap;
    __aspectRatio: GalleryAspectRatio;
    __lightbox: boolean;

    static getType(): string {
        return 'image-gallery';
    }

    static clone(node: ImageGalleryNode): ImageGalleryNode {
        return new ImageGalleryNode([...node.__images], node.__columns, node.__mobileColumns, node.__gap, node.__aspectRatio, node.__lightbox, node.__key);
    }

    constructor(images: GalleryImage[] = [], columns = 3, mobileColumns = 1, gap: GalleryGap = 'normal', aspectRatio: GalleryAspectRatio = 'square', lightbox = false, key?: NodeKey) {
        super(key);
        this.__images = images;
        this.__columns = columns;
        this.__mobileColumns = mobileColumns;
        this.__gap = gap;
        this.__aspectRatio = aspectRatio;
        this.__lightbox = lightbox;
    }

    static importJSON(serialized: SerializedImageGalleryNode): ImageGalleryNode {
        return $createImageGalleryNode(serialized.images, serialized.columns, serialized.mobileColumns ?? 1, serialized.gap ?? 'normal', serialized.aspectRatio ?? 'square', serialized.lightbox ?? false);
    }

    exportJSON(): SerializedImageGalleryNode {
        return {
            type: 'image-gallery',
            version: 2,
            images: this.__images,
            columns: this.__columns,
            mobileColumns: this.__mobileColumns,
            gap: this.__gap,
            aspectRatio: this.__aspectRatio,
            lightbox: this.__lightbox,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            figure: (domNode: HTMLElement) => {
                if (domNode.getAttribute('data-rte-gallery') !== 'true') return null;

                return { conversion: convertGalleryElement, priority: 2 };
            },
            div: (domNode: HTMLElement) => {
                if (domNode.getAttribute('data-type') !== 'image-gallery' && domNode.getAttribute('data-gallery') !== 'true') return null;
                return { conversion: convertGalleryElement, priority: 1 };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const wrapper = document.createElement('figure');
        wrapper.setAttribute('data-rte-gallery', 'true');
        wrapper.setAttribute('data-gallery', 'true');
        wrapper.setAttribute('data-images', JSON.stringify(this.__images));
        wrapper.setAttribute('data-columns', String(this.__columns));
        wrapper.setAttribute('data-mobile-columns', String(this.__mobileColumns));
        wrapper.setAttribute('data-gap', this.__gap);
        wrapper.setAttribute('data-aspect-ratio', this.__aspectRatio);
        wrapper.setAttribute('data-lightbox', String(this.__lightbox));
        wrapper.className = 'rte-gallery';
        wrapper.style.display = 'grid';
        wrapper.style.gridTemplateColumns = `repeat(${this.__columns}, 1fr)`;
        wrapper.style.gap = GAP_VALUES[this.__gap];
        for (const img of this.__images) {
            const item = document.createElement('figure');
            item.setAttribute('data-gallery-item', 'true');
            if (img.mediaId !== null) item.setAttribute('data-media-id', String(img.mediaId));
            const imgEl = document.createElement('img');
            imgEl.setAttribute('src', img.src);
            imgEl.setAttribute('alt', img.alt);
            const exportedAspectRatio = ASPECT_RATIO_STYLES[this.__aspectRatio];
            imgEl.style.cssText = `width:100%;${exportedAspectRatio ? `aspect-ratio:${exportedAspectRatio};` : 'height:auto;'}object-fit:cover;border-radius:4px;`;
            item.appendChild(imgEl);
            if (img.caption) {
                const caption = document.createElement('figcaption');
                caption.textContent = img.caption;
                item.appendChild(caption);
            }
            wrapper.appendChild(item);
        }
        return { element: wrapper };
    }

    createDOM(): HTMLElement {
        return document.createElement('div');
    }

    updateDOM(): false {
        return false;
    }

    isInline(): false {
        return false;
    }

    update(changes: Partial<{ images: GalleryImage[]; columns: number; mobileColumns: number; gap: GalleryGap; aspectRatio: GalleryAspectRatio; lightbox: boolean }>): void {
        const writable = this.getWritable();
        if (changes.images !== undefined) writable.__images = changes.images;
        if (changes.columns !== undefined) writable.__columns = changes.columns;
        if (changes.mobileColumns !== undefined) writable.__mobileColumns = changes.mobileColumns;
        if (changes.gap !== undefined) writable.__gap = changes.gap;
        if (changes.aspectRatio !== undefined) writable.__aspectRatio = changes.aspectRatio;
        if (changes.lightbox !== undefined) writable.__lightbox = changes.lightbox;
    }

    decorate(editor: LexicalEditor, _config: EditorConfig): JSX.Element {
        return (
            <ImageGalleryComponent
                images={this.__images}
                columns={this.__columns}
                mobileColumns={this.__mobileColumns}
                gap={this.__gap}
                aspectRatio={this.__aspectRatio}
                lightbox={this.__lightbox}
                nodeKey={this.__key}
                editor={editor}
            />
        );
    }
}

function convertGalleryElement(domNode: HTMLElement): DOMConversionOutput | null {
    let images: GalleryImage[] = [];
    try {
        images = JSON.parse(domNode.getAttribute('data-images') ?? '[]');
    } catch {
        images = [];
    }
    if (images.length === 0) {
        images = Array.from(domNode.querySelectorAll('img')).map((img) => ({
            mediaId: parseInt(img.closest('[data-media-id]')?.getAttribute('data-media-id') ?? '', 10) || null,
            src: img.getAttribute('src') ?? '',
            alt: img.getAttribute('alt') ?? '',
            caption: img.closest('figure')?.querySelector('figcaption')?.textContent ?? null,
            width: null,
            height: null,
            focalPoint: null,
        }));
    }
    const columns = parseInt(domNode.getAttribute('data-columns') ?? '3', 10);
    const mobileColumns = parseInt(domNode.getAttribute('data-mobile-columns') ?? '1', 10);
    return {
        node: $createImageGalleryNode(
            images,
            columns,
            mobileColumns,
            (domNode.getAttribute('data-gap') as GalleryGap | null) ?? 'normal',
            (domNode.getAttribute('data-aspect-ratio') as GalleryAspectRatio | null) ?? 'square',
            domNode.getAttribute('data-lightbox') === 'true',
        ),
    };
}

export function $createImageGalleryNode(images: GalleryImage[] = [], columns = 3, mobileColumns = 1, gap: GalleryGap = 'normal', aspectRatio: GalleryAspectRatio = 'square', lightbox = false): ImageGalleryNode {
    return $applyNodeReplacement(new ImageGalleryNode(images, columns, mobileColumns, gap, aspectRatio, lightbox));
}

export function $isImageGalleryNode(node: LexicalNode | null | undefined): node is ImageGalleryNode {
    return node instanceof ImageGalleryNode;
}

export type { GalleryAspectRatio, GalleryGap, GalleryImage, SerializedImageGalleryNode };
