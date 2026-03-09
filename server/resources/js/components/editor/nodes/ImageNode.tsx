import type {
    DOMConversionMap,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { $applyNodeReplacement, createEditor, DecoratorNode } from 'lexical';
import { type JSX } from 'react';
import { lazy, Suspense } from 'react';

const ImageComponent = lazy(() => import('./ImageComponent'));

export interface ImagePayload {
    altText: string;
    caption?: LexicalEditor;
    height?: number | 'inherit';
    key?: NodeKey;
    maxWidth?: number;
    showCaption?: boolean;
    src: string;
    width?: number | 'inherit';
    captionsEnabled?: boolean;
}

export type SerializedImageNode = Spread<
    {
        altText: string;
        caption: ReturnType<LexicalEditor['toJSON']>;
        height?: number | 'inherit';
        maxWidth: number;
        showCaption: boolean;
        src: string;
        width?: number | 'inherit';
    },
    SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __width: 'inherit' | number;
    __height: 'inherit' | number;
    __maxWidth: number;
    __showCaption: boolean;
    __caption: LexicalEditor;
    __captionsEnabled: boolean;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__maxWidth,
            node.__width,
            node.__height,
            node.__showCaption,
            node.__caption,
            node.__captionsEnabled,
            node.__key,
        );
    }

    constructor(
        src: string,
        altText: string,
        maxWidth: number,
        width?: 'inherit' | number,
        height?: 'inherit' | number,
        showCaption?: boolean,
        caption?: LexicalEditor,
        captionsEnabled?: boolean,
        key?: NodeKey,
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width || 'inherit';
        this.__height = height || 'inherit';
        this.__showCaption = showCaption || false;
        this.__caption = caption || createEditor();
        this.__captionsEnabled = captionsEnabled ?? false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        element.setAttribute('width', this.__width.toString());
        element.setAttribute('height', this.__height.toString());
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: (domNode: HTMLElement) => {
                    if (!(domNode instanceof HTMLImageElement)) return null;
                    const { src, alt, width, height } = domNode;
                    return {
                        node: $createImageNode({
                            src,
                            altText: alt,
                            maxWidth: 800,
                            // @ts-expect-error - DOM width/height attribute parsing
                            width: width ? parseInt(width) : 'inherit',
                            // @ts-expect-error - DOM width/height attribute parsing
                            height: height ? parseInt(height) : 'inherit',
                        }),
                    };
                },
                priority: 0,
            }),
        };
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, maxWidth, src, showCaption, caption } = serializedNode;
        const node = $createImageNode({ src, altText, maxWidth, width, height });
        const nestedEditor = node.__caption;
        const editorState = nestedEditor.parseEditorState(caption.editorState);
        if (!editorState.isEmpty()) nestedEditor.setEditorState(editorState);
        node.setShowCaption(showCaption);
        return node;
    }

    exportJSON(): SerializedImageNode {
        return {
            type: 'image',
            version: 1,
            altText: this.getAltText(),
            caption: this.__caption.toJSON(),
            height: this.__height === 'inherit' ? 0 : this.__height,
            maxWidth: this.__maxWidth,
            showCaption: this.__showCaption,
            src: this.getSrc(),
            width: this.__width === 'inherit' ? 0 : this.__width,
        };
    }

    setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    setShowCaption(showCaption: boolean): void {
        this.getWritable().__showCaption = showCaption;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) span.className = className;
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
    }

    decorate(): JSX.Element {
        return (
            <Suspense fallback={null}>
                <ImageComponent
                    src={this.__src}
                    altText={this.__altText}
                    width={this.__width}
                    height={this.__height}
                    maxWidth={this.__maxWidth}
                    nodeKey={this.getKey()}
                    showCaption={this.__showCaption}
                    caption={this.__caption}
                    captionsEnabled={this.__captionsEnabled}
                    resizable={true}
                />
            </Suspense>
        );
    }
}

export function $createImageNode({
    src,
    altText,
    maxWidth = 500,
    width,
    height,
    captionsEnabled,
    key,
}: ImagePayload): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, maxWidth, width, height, false, undefined, captionsEnabled, key));
}

export function $isImageNode(node: unknown): node is ImageNode {
    return node instanceof ImageNode;
}
