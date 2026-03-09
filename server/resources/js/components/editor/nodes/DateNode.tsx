import type { DOMConversionMap, DOMExportOutput, EditorConfig, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { lazy, Suspense, type JSX } from 'react';

const DateComponent = lazy(() => import('./DateComponent'));

export type SerializedDateNode = Spread<{ isoDate: string }, SerializedLexicalNode>;

export class DateNode extends DecoratorNode<JSX.Element> {
    __isoDate: string;

    static getType(): string {
        return 'date';
    }

    static clone(node: DateNode): DateNode {
        return new DateNode(node.__isoDate, node.__key);
    }

    constructor(isoDate: string, key?: NodeKey) {
        super(key);
        this.__isoDate = isoDate;
    }

    isInline(): boolean {
        return true;
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        span.className = 'date-node-wrapper';
        return span;
    }

    updateDOM(): false {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const span = document.createElement('span');
        span.setAttribute('data-lexical-date', this.__isoDate);
        span.textContent = new Date(this.__isoDate + 'T00:00:00').toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return { element: span };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            span: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute('data-lexical-date')) return null;
                return {
                    conversion: (node: HTMLElement) => ({
                        node: $createDateNode(node.getAttribute('data-lexical-date') ?? new Date().toISOString().slice(0, 10)),
                    }),
                    priority: 1 as const,
                };
            },
        };
    }

    static importJSON(serialized: SerializedDateNode): DateNode {
        return $createDateNode(serialized.isoDate);
    }

    exportJSON(): SerializedDateNode {
        return {
            type: 'date',
            version: 1,
            isoDate: this.__isoDate,
        };
    }

    setDate(isoDate: string): void {
        const writable = this.getWritable();
        writable.__isoDate = isoDate;
    }

    getDate(): string {
        return this.__isoDate;
    }

    decorate(): JSX.Element {
        return (
            <Suspense fallback={null}>
                <DateComponent isoDate={this.__isoDate} nodeKey={this.getKey()} />
            </Suspense>
        );
    }
}

export function $createDateNode(isoDate: string): DateNode {
    return $applyNodeReplacement(new DateNode(isoDate));
}

export function $isDateNode(node: unknown): node is DateNode {
    return node instanceof DateNode;
}
