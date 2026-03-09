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
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import type { JSX } from 'react';
import { useRef, useState } from 'react';

export type ImageAlign = 'none' | 'left' | 'center' | 'right';

export type SerializedImageNode = Spread<
    {
        src: string;
        altText: string;
        width?: string;
        align: ImageAlign;
    },
    SerializedLexicalNode
>;

const WIDTH_PRESETS = ['25%', '50%', '75%', '100%'] as const;

function ImageComponent({
    src,
    altText,
    width,
    align,
    nodeKey,
    editor,
}: {
    src: string;
    altText: string;
    width?: string;
    align: ImageAlign;
    nodeKey: NodeKey;
    editor: LexicalEditor;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [localWidth, setLocalWidth] = useState<string | undefined>(width);

    const update = (changes: Partial<{ width: string; align: ImageAlign }>) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                if (changes.width !== undefined) node.setWidth(changes.width);
                if (changes.align !== undefined) node.setAlign(changes.align);
            }
        });
    };

    const startResize = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = imgRef.current?.offsetWidth ?? 300;
        dragRef.current = { startX, startWidth };

        const onMove = (ev: MouseEvent) => {
            if (!dragRef.current || !imgRef.current) return;
            const newW = Math.max(50, dragRef.current.startWidth + (ev.clientX - dragRef.current.startX));
            imgRef.current.style.width = `${newW}px`;
        };

        const onUp = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const newW = Math.max(50, dragRef.current.startWidth + (ev.clientX - dragRef.current.startX));
            const newWidth = `${newW}px`;
            setLocalWidth(newWidth);
            update({ width: newWidth });
            dragRef.current = null;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const outerStyle: React.CSSProperties = { display: 'block', position: 'relative', marginBottom: '0.5em' };
    if (align === 'left') {
        outerStyle.float = 'left';
        outerStyle.marginRight = '1em';
    } else if (align === 'right') {
        outerStyle.float = 'right';
        outerStyle.marginLeft = '1em';
    } else if (align === 'center') {
        outerStyle.marginLeft = 'auto';
        outerStyle.marginRight = 'auto';
    }

    const btnStyle = (active: boolean): React.CSSProperties => ({
        padding: '2px 6px',
        fontSize: '11px',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
        color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
        userSelect: 'none',
    });

    return (
        <span style={outerStyle} onClick={() => setIsSelected((s) => !s)}>
            <img
                ref={imgRef}
                src={src}
                alt={altText}
                style={{ display: 'block', height: 'auto', width: localWidth ?? 'auto', maxWidth: '100%' }}
                draggable={false}
                className={`rounded-lg transition-shadow ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}`}
            />
            {isSelected && (
                <>
                    <span
                        contentEditable={false}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            padding: '3px 4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {WIDTH_PRESETS.map((w) => (
                            <button
                                key={w}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setLocalWidth(w);
                                    update({ width: w });
                                }}
                                style={btnStyle(localWidth === w)}
                                title={`Width ${w}`}
                            >
                                {w}
                            </button>
                        ))}
                        <span style={{ width: 1, height: 16, background: 'hsl(var(--border))', margin: '0 2px' }} />
                        {(
                            [
                                ['none', <AlignLeft key="none" size={12} />, 'None'],
                                ['left', <AlignLeft key="left" size={12} />, 'Float left'],
                                ['center', <AlignCenter key="center" size={12} />, 'Center'],
                                ['right', <AlignRight key="right" size={12} />, 'Float right'],
                            ] as const
                        ).map(([a, icon, title]) => (
                            <button
                                key={a}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    update({ align: a });
                                }}
                                style={btnStyle(align === a)}
                                title={title}
                            >
                                {icon}
                            </button>
                        ))}
                    </span>
                    <span
                        contentEditable={false}
                        onMouseDown={startResize}
                        style={{
                            position: 'absolute',
                            bottom: -5,
                            right: -5,
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            backgroundColor: 'hsl(var(--primary))',
                            cursor: 'nwse-resize',
                            zIndex: 10,
                        }}
                    />
                </>
            )}
        </span>
    );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __width?: string;
    __align: ImageAlign;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__altText, node.__width, node.__align, node.__key);
    }

    constructor(src: string, altText: string, width?: string, align: ImageAlign = 'none', key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__width = width;
        this.__align = align;
    }

    static importJSON(serialized: SerializedImageNode): ImageNode {
        return $createImageNode(serialized);
    }

    exportJSON(): SerializedImageNode {
        return {
            type: 'image',
            version: 1,
            src: this.__src,
            altText: this.__altText,
            width: this.__width,
            align: this.__align,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        };
    }

    exportDOM(): DOMExportOutput {
        const img = document.createElement('img');
        img.setAttribute('src', this.__src);
        img.setAttribute('alt', this.__altText);
        img.setAttribute('class', 'rounded-lg');
        if (this.__width) img.style.width = this.__width;
        if (this.__align === 'left') {
            img.style.float = 'left';
            img.style.marginRight = '1em';
            img.style.marginBottom = '0.5em';
        } else if (this.__align === 'right') {
            img.style.float = 'right';
            img.style.marginLeft = '1em';
            img.style.marginBottom = '0.5em';
        } else if (this.__align === 'center') {
            img.style.display = 'block';
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
        }
        return { element: img };
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

    setWidth(width: string | undefined): void {
        const writable = this.getWritable();
        writable.__width = width;
    }

    setAlign(align: ImageAlign): void {
        const writable = this.getWritable();
        writable.__align = align;
    }

    decorate(editor: LexicalEditor, _config: EditorConfig): JSX.Element {
        return (
            <ImageComponent
                src={this.__src}
                altText={this.__altText}
                width={this.__width}
                align={this.__align}
                nodeKey={this.__key}
                editor={editor}
            />
        );
    }
}

function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
    const img = domNode as HTMLImageElement;
    const src = img.getAttribute('src');
    if (!src) return null;
    const altText = img.getAttribute('alt') ?? '';
    const width = img.style.width || img.getAttribute('width') || undefined;
    return { node: $createImageNode({ src, altText, width }) };
}

export function $createImageNode({
    src,
    altText,
    width,
    align,
}: {
    src: string;
    altText: string;
    width?: string;
    align?: ImageAlign;
}): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, width, align));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}
