import type { EditorConfig, NodeKey, SerializedTextNode } from 'lexical';
import { $applyNodeReplacement, TextNode } from 'lexical';

export class SpecialTextNode extends TextNode {
    static getType(): string {
        return 'special-text';
    }

    static clone(node: SpecialTextNode): SpecialTextNode {
        return new SpecialTextNode(node.__text, node.__key);
    }

    constructor(text: string, key?: NodeKey) {
        super(text, key);
    }

    static importJSON(node: SerializedTextNode): SpecialTextNode {
        return $createSpecialTextNode(node.text);
    }

    exportJSON(): SerializedTextNode {
        return { ...super.exportJSON(), type: 'special-text', version: 1 };
    }

    createDOM(config: EditorConfig): HTMLSpanElement {
        const dom = super.createDOM(config) as HTMLSpanElement;
        dom.style.color = 'rgb(55, 148, 255)';
        return dom;
    }

    updateDOM(prevNode: SpecialTextNode, dom: HTMLElement, config: EditorConfig): boolean {
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

export function $createSpecialTextNode(text: string): SpecialTextNode {
    return $applyNodeReplacement(new SpecialTextNode(text));
}

export function $isSpecialTextNode(node: unknown): node is SpecialTextNode {
    return node instanceof SpecialTextNode;
}
