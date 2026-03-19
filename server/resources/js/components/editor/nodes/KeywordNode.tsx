import type { EditorConfig, NodeKey, SerializedTextNode } from 'lexical';
import { $applyNodeReplacement, TextNode } from 'lexical';

export class KeywordNode extends TextNode {
    static getType(): string {
        return 'keyword';
    }

    static clone(node: KeywordNode): KeywordNode {
        return new KeywordNode(node.__text, node.__key);
    }

    constructor(text: string, key?: NodeKey) {
        super(text, key);
    }

    static importJSON(node: SerializedTextNode): KeywordNode {
        return $createKeywordNode(node.text);
    }

    exportJSON(): SerializedTextNode {
        return { ...super.exportJSON(), type: 'keyword', version: 1 };
    }

    createDOM(config: EditorConfig): HTMLSpanElement {
        const dom = super.createDOM(config) as HTMLSpanElement;
        dom.className = 'editor-keyword';
        return dom;
    }

    updateDOM(
        prevNode: KeywordNode,
        dom: HTMLElement,
        config: EditorConfig,
    ): boolean {
        // @ts-expect-error - Lexical TextNode prevNode typing
        return super.updateDOM(prevNode, dom, config);
    }

    static importDOM() {
        return null;
    }

    isTextEntity(): true {
        return true;
    }
}

export function $createKeywordNode(keyword: string): KeywordNode {
    return $applyNodeReplacement(new KeywordNode(keyword));
}

export function $isKeywordNode(node: unknown): node is KeywordNode {
    return node instanceof KeywordNode;
}
