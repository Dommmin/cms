import {
    $applyNodeReplacement,
    $getNodeByKey,
    DecoratorNode,
    type LexicalNode,
    type NodeKey,
    type EditorConfig,
    type LexicalEditor,
    type DOMConversionMap,
    type DOMConversionOutput,
    type DOMExportOutput,
} from 'lexical';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

export type CalloutVariant = 'info' | 'warning' | 'success' | 'danger';

export type SerializedCalloutNode = {
    type: 'callout';
    variant: CalloutVariant;
    version: 1;
};

const CALLOUT_STYLES: Record<CalloutVariant, { bg: string; border: string; text: string; icon: JSX.Element }> = {
    info: {
        bg: 'var(--callout-info-bg, #eff6ff)',
        border: 'var(--callout-info-border, #3b82f6)',
        text: 'var(--callout-info-text, #1e40af)',
        icon: <Info size={20} />,
    },
    warning: {
        bg: 'var(--callout-warning-bg, #fffbeb)',
        border: 'var(--callout-warning-border, #f59e0b)',
        text: 'var(--callout-warning-text, #92400e)',
        icon: <AlertTriangle size={20} />,
    },
    success: {
        bg: 'var(--callout-success-bg, #f0fdf4)',
        border: 'var(--callout-success-border, #22c55e)',
        text: 'var(--callout-success-text, #166534)',
        icon: <CheckCircle2 size={20} />,
    },
    danger: {
        bg: 'var(--callout-danger-bg, #fef2f2)',
        border: 'var(--callout-danger-border, #ef4444)',
        text: 'var(--callout-danger-text, #991b1b)',
        icon: <XCircle size={20} />,
    },
};

const VARIANT_LABELS: Record<CalloutVariant, string> = {
    info: 'Info',
    warning: 'Warning',
    success: 'Success',
    danger: 'Danger',
};

function CalloutComponent({
    variant,
    nodeKey,
    editor,
}: {
    variant: CalloutVariant;
    nodeKey: NodeKey;
    editor: LexicalEditor;
}): JSX.Element {
    const [currentVariant, setCurrentVariant] = useState<CalloutVariant>(variant);
    const styles = CALLOUT_STYLES[currentVariant];

    const handleChangeVariant = (v: CalloutVariant) => {
        setCurrentVariant(v);
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node instanceof CalloutNode) {
                node.setVariant(v);
            }
        });
    };

    return (
        <div
            contentEditable={false}
            data-callout={currentVariant}
            className="my-3 flex items-start gap-3 rounded-lg border-l-4 p-4"
            style={{
                backgroundColor: styles.bg,
                borderColor: styles.border,
                color: styles.text,
            }}
        >
            <span className="mt-0.5 shrink-0" style={{ color: styles.border }}>
                {styles.icon}
            </span>
            <div className="min-w-0 flex-1 callout-content" contentEditable suppressContentEditableWarning />
            <div className="flex shrink-0 flex-col gap-1">
                {(Object.keys(VARIANT_LABELS) as CalloutVariant[]).map((v) => (
                    <button
                        key={v}
                        type="button"
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                            currentVariant === v ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                        }`}
                        style={{
                            backgroundColor: CALLOUT_STYLES[v].border,
                            color: '#fff',
                        }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            handleChangeVariant(v);
                        }}
                        title={VARIANT_LABELS[v]}
                    >
                        {VARIANT_LABELS[v].charAt(0).toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}

export class CalloutNode extends DecoratorNode<JSX.Element> {
    __variant: CalloutVariant;

    static getType(): string {
        return 'callout';
    }

    static clone(node: CalloutNode): CalloutNode {
        return new CalloutNode(node.__variant, node.__key);
    }

    constructor(variant: CalloutVariant = 'info', key?: NodeKey) {
        super(key);
        this.__variant = variant;
    }

    static importJSON(serialized: SerializedCalloutNode): CalloutNode {
        return $createCalloutNode(serialized.variant);
    }

    exportJSON(): SerializedCalloutNode {
        return {
            type: 'callout',
            variant: this.__variant,
            version: 1,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            div: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute('data-callout')) return null;
                const variant = domNode.getAttribute('data-callout') as CalloutVariant | null;
                if (!variant || !CALLOUT_STYLES[variant]) return null;
                return { conversion: convertCalloutElement, priority: 2 };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const div = document.createElement('div');
        div.setAttribute('data-callout', this.__variant);
        div.className = `callout callout-${this.__variant}`;
        const styles = CALLOUT_STYLES[this.__variant];
        div.style.backgroundColor = styles.bg;
        div.style.borderLeft = `4px solid ${styles.border}`;
        div.style.color = styles.text;
        div.style.padding = '1rem';
        div.style.borderRadius = '0.5rem';
        div.style.margin = '0.75rem 0';
        return { element: div };
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.setAttribute('data-callout', this.__variant);
        return div;
    }

    updateDOM(): false {
        return false;
    }

    isInline(): false {
        return false;
    }

    decorate(editor: LexicalEditor, _config: EditorConfig): JSX.Element {
        return <CalloutComponent variant={this.__variant} nodeKey={this.__key} editor={editor} />;
    }

    setVariant(variant: CalloutVariant): void {
        const writable = this.getWritable();
        writable.__variant = variant;
    }
}

function convertCalloutElement(domNode: HTMLElement): DOMConversionOutput {
    const variant = (domNode.getAttribute('data-callout') as CalloutVariant) || 'info';
    const node = $createCalloutNode(variant);
    const contentDiv = domNode.querySelector('.callout-content');
    if (contentDiv && contentDiv.textContent) {
        void contentDiv.textContent;
    }
    return { node };
}

export function $createCalloutNode(variant: CalloutVariant = 'info'): CalloutNode {
    return $applyNodeReplacement(new CalloutNode(variant));
}

export function $isCalloutNode(node: LexicalNode | null | undefined): node is CalloutNode {
    return node instanceof CalloutNode;
}