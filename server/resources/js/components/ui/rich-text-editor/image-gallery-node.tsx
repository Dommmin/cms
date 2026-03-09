import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { $applyNodeReplacement, $getNodeByKey, DecoratorNode } from 'lexical';
import { Plus, X } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { MediaPickerModal, type MediaItem } from '@/components/media-picker-modal';

interface GalleryImage {
    src: string;
    alt: string;
}

export type SerializedImageGalleryNode = Spread<
    { images: GalleryImage[]; columns: number },
    SerializedLexicalNode
>;

function ImageGalleryComponent({
    images,
    columns,
    nodeKey,
    editor,
}: {
    images: GalleryImage[];
    columns: number;
    nodeKey: NodeKey;
    editor: LexicalEditor;
}) {
    const [showPicker, setShowPicker] = useState(false);

    const updateNode = (changes: Partial<{ images: GalleryImage[]; columns: number }>) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageGalleryNode(node)) {
                if (changes.images !== undefined) node.setImages(changes.images);
                if (changes.columns !== undefined) node.setColumns(changes.columns);
            }
        });
    };

    const handleMediaSelect = (media: MediaItem) => {
        updateNode({ images: [...images, { src: media.url, alt: media.name }] });
        setShowPicker(false);
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
                <div className="ml-auto flex items-center gap-1">
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
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '8px',
                }}
            >
                {images.map((img, i) => (
                    <div key={i} className="group relative">
                        <img src={img.src} alt={img.alt} className="h-32 w-full rounded object-cover" />
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
                onReorder={() => {}}
                onRemove={() => {}}
                onSetThumbnail={() => {}}
                selectedImages={[]}
                multiple={false}
            />
        </div>
    );
}

export class ImageGalleryNode extends DecoratorNode<JSX.Element> {
    __images: GalleryImage[];
    __columns: number;

    static getType(): string {
        return 'image-gallery';
    }

    static clone(node: ImageGalleryNode): ImageGalleryNode {
        return new ImageGalleryNode([...node.__images], node.__columns, node.__key);
    }

    constructor(images: GalleryImage[] = [], columns = 3, key?: NodeKey) {
        super(key);
        this.__images = images;
        this.__columns = columns;
    }

    static importJSON(serialized: SerializedImageGalleryNode): ImageGalleryNode {
        return $createImageGalleryNode(serialized.images, serialized.columns);
    }

    exportJSON(): SerializedImageGalleryNode {
        return {
            type: 'image-gallery',
            version: 1,
            images: this.__images,
            columns: this.__columns,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            div: (domNode: HTMLElement) => {
                if (domNode.getAttribute('data-type') !== 'image-gallery') return null;
                return { conversion: convertGalleryElement, priority: 1 };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-type', 'image-gallery');
        wrapper.setAttribute('data-images', JSON.stringify(this.__images));
        wrapper.setAttribute('data-columns', String(this.__columns));
        wrapper.style.display = 'grid';
        wrapper.style.gridTemplateColumns = `repeat(${this.__columns}, 1fr)`;
        wrapper.style.gap = '8px';
        for (const img of this.__images) {
            const imgEl = document.createElement('img');
            imgEl.setAttribute('src', img.src);
            imgEl.setAttribute('alt', img.alt);
            imgEl.style.cssText = 'width:100%;height:200px;object-fit:cover;border-radius:4px;';
            wrapper.appendChild(imgEl);
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

    setImages(images: GalleryImage[]): void {
        this.getWritable().__images = images;
    }

    setColumns(columns: number): void {
        this.getWritable().__columns = columns;
    }

    decorate(editor: LexicalEditor, _config: EditorConfig): JSX.Element {
        return (
            <ImageGalleryComponent
                images={this.__images}
                columns={this.__columns}
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
    const columns = parseInt(domNode.getAttribute('data-columns') ?? '3', 10);
    return { node: $createImageGalleryNode(images, columns) };
}

export function $createImageGalleryNode(images: GalleryImage[] = [], columns = 3): ImageGalleryNode {
    return $applyNodeReplacement(new ImageGalleryNode(images, columns));
}

export function $isImageGalleryNode(node: LexicalNode | null | undefined): node is ImageGalleryNode {
    return node instanceof ImageGalleryNode;
}
