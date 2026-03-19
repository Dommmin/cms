import type { EditorConfig, NodeKey, SerializedTextNode } from 'lexical';
import { $applyNodeReplacement, TextNode } from 'lexical';

export type SerializedMentionNode = SerializedTextNode & {
    mentionName: string;
};

export class MentionNode extends TextNode {
    __mention: string;

    static getType(): string {
        return 'mention';
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__mention, node.__text, node.__key);
    }

    constructor(mentionName: string, text?: string, key?: NodeKey) {
        super(text ?? mentionName, key);
        this.__mention = mentionName;
    }

    static importJSON(serializedNode: SerializedMentionNode): MentionNode {
        const node = $createMentionNode(serializedNode.mentionName);
        node.setTextContent(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    exportJSON(): SerializedMentionNode {
        return {
            ...super.exportJSON(),
            mentionName: this.__mention,
            type: 'mention',
            version: 1,
        };
    }

    createDOM(config: EditorConfig): HTMLSpanElement {
        const dom = super.createDOM(config) as HTMLSpanElement;
        dom.className = 'mention';
        return dom;
    }

    updateDOM(
        prevNode: MentionNode,
        dom: HTMLElement,
        config: EditorConfig,
    ): boolean {
        // @ts-expect-error - Lexical TextNode prevNode typing
        return super.updateDOM(prevNode, dom, config);
    }

    static importDOM() {
        return null;
    }

    isToken(): false {
        return false;
    }

    canInsertTextBefore(): boolean {
        return false;
    }

    canInsertTextAfter(): boolean {
        return false;
    }

    isTextEntity(): true {
        return true;
    }
}

export function $createMentionNode(mentionName: string): MentionNode {
    return $applyNodeReplacement(new MentionNode(mentionName));
}

export function $isMentionNode(node: unknown): node is MentionNode {
    return node instanceof MentionNode;
}
