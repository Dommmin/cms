import type {
    DOMConversionMap,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { type JSX } from 'react';

export type SerializedFigmaNode = Spread<{ documentID: string }, SerializedLexicalNode>;

export class FigmaNode extends DecoratorNode<JSX.Element> {
    __id: string;

    static getType(): string {
        return 'figma';
    }

    static clone(node: FigmaNode): FigmaNode {
        return new FigmaNode(node.__id, node.__key);
    }

    constructor(id: string, key?: NodeKey) {
        super(key);
        this.__id = id;
    }

    static importJSON(node: SerializedFigmaNode): FigmaNode {
        return $createFigmaNode(node.documentID);
    }

    exportJSON(): SerializedFigmaNode {
        return { type: 'figma', version: 1, documentID: this.__id };
    }

    createDOM(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'editor-figma-embed';
        return div;
    }

    updateDOM(): false {
        return false;
    }

    decorate(): JSX.Element {
        return (
            <div className="my-4 w-full">
                <iframe
                    src={`https://www.figma.com/embed?embed_host=lexical&url=https://www.figma.com/file/${this.__id}`}
                    width="100%"
                    height="450"
                    className="rounded-lg border border-border"
                    allowFullScreen
                    title="Figma document"
                />
            </div>
        );
    }
}

export function $createFigmaNode(documentID: string): FigmaNode {
    return $applyNodeReplacement(new FigmaNode(documentID));
}

export function $isFigmaNode(node: unknown): node is FigmaNode {
    return node instanceof FigmaNode;
}
