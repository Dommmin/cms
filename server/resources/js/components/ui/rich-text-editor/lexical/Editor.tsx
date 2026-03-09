import { registerCodeHighlighting } from '@lexical/code';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useEffect, type JSX } from 'react';
import { nodes } from './nodes';
import HtmlPlugin from './plugins/HtmlPlugin';
import MarkdownPlugin from './plugins/MarkdownPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { theme } from './theme';

export type Props = {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
};

const initialConfig: InitialConfigType = {
    namespace: 'RichTextEditor',
    theme,
    nodes,
    onError(error) {
        throw error;
    },
};

function CodePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return registerCodeHighlighting(editor);
    }, [editor]);

    return null;
}

export default function Editor({
    value,
    onChange,
    placeholder = 'Start writing...',
    className,
}: Props): JSX.Element {
    return (
        <div className={`editor-container ${className ?? ''}`.trim()}>
            <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />
                <div className="editor-input">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-content" />}
                        placeholder={<div className="editor-placeholder">{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin validateUrl={(url) => /^https?:\/\//.test(url) || /^mailto:/.test(url)} />
                <CodePlugin />
                <TablePlugin hasCellMerge hasCellBackgroundColor={false} />
                <MarkdownPlugin />
                <HtmlPlugin value={value} onChange={onChange} />
            </LexicalComposer>
        </div>
    );
}
