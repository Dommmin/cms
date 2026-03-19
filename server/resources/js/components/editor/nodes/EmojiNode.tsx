import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { type JSX } from 'react';

export type SerializedEmojiNode = Spread<
    { emoji: string },
    SerializedLexicalNode
>;

export class EmojiNode extends DecoratorNode<JSX.Element> {
    __emoji: string;

    static getType(): string {
        return 'emoji';
    }

    static clone(node: EmojiNode): EmojiNode {
        return new EmojiNode(node.__emoji, node.__key);
    }

    constructor(emoji: string, key?: NodeKey) {
        super(key);
        this.__emoji = emoji;
    }

    static importJSON(node: SerializedEmojiNode): EmojiNode {
        return $createEmojiNode(node.emoji);
    }

    exportJSON(): SerializedEmojiNode {
        return { type: 'emoji', version: 1, emoji: this.__emoji };
    }

    createDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'emoji';
        span.textContent = this.__emoji;
        return span;
    }

    updateDOM(prevNode: EmojiNode, dom: HTMLElement): boolean {
        if (prevNode.__emoji !== this.__emoji) {
            dom.textContent = this.__emoji;
        }
        return false;
    }

    decorate(): JSX.Element {
        return <span className="emoji">{this.__emoji}</span>;
    }
}

export function $createEmojiNode(emoji: string): EmojiNode {
    return $applyNodeReplacement(new EmojiNode(emoji));
}

export function $isEmojiNode(node: unknown): node is EmojiNode {
    return node instanceof EmojiNode;
}
