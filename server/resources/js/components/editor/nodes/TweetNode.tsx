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

export type SerializedTweetNode = Spread<{ id: string }, SerializedLexicalNode>;

export class TweetNode extends DecoratorNode<JSX.Element> {
    __id: string;

    static getType(): string {
        return 'tweet';
    }

    static clone(node: TweetNode): TweetNode {
        return new TweetNode(node.__id, node.__key);
    }

    constructor(id: string, key?: NodeKey) {
        super(key);
        this.__id = id;
    }

    static importJSON(node: SerializedTweetNode): TweetNode {
        return $createTweetNode(node.id);
    }

    exportJSON(): SerializedTweetNode {
        return { type: 'tweet', version: 1, id: this.__id };
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = 'editor-tweet-embed';
        return div;
    }

    updateDOM(): false {
        return false;
    }

    decorate(): JSX.Element {
        return (
            <div className="mx-auto my-4 max-w-md rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Tweet ID: {this.__id}</p>
                <a
                    href={`https://twitter.com/i/web/status/${this.__id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                >
                    View on Twitter/X
                </a>
            </div>
        );
    }
}

export function $createTweetNode(id: string): TweetNode {
    return $applyNodeReplacement(new TweetNode(id));
}

export function $isTweetNode(node: unknown): node is TweetNode {
    return node instanceof TweetNode;
}
