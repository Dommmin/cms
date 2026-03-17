import { registerCodeHighlighting } from '@lexical/code';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useEffect, useRef, type JSX } from 'react';
import { nodes } from './nodes';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatPlugin from './plugins/FloatingTextFormatPlugin';
import CopyCodePlugin from './plugins/CopyCodePlugin';
import TableActionMenuPlugin from './plugins/TableActionMenuPlugin';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import HtmlPlugin from './plugins/HtmlPlugin';
import MarkdownPlugin from './plugins/MarkdownPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import WordCountPlugin from './plugins/WordCountPlugin';
import { theme } from './theme';

export type Props = {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    maxHeight?: number | string;
    editable?: boolean;
    showWordCount?: boolean;
};

function buildConfig(editable: boolean): InitialConfigType {
    return {
        namespace: 'RichTextEditor',
        theme,
        nodes,
        editable,
        onError(error) {
            throw error;
        },
    };
}

function CodePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => registerCodeHighlighting(editor), [editor]);
    return null;
}

function EditablePlugin({ editable }: { editable: boolean }): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => { editor.setEditable(editable); }, [editor, editable]);
    return null;
}

export default function Editor({ value, onChange, placeholder = 'Start writing...', className, maxHeight, editable = true, showWordCount = true }: Props): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);
    const config = useRef(buildConfig(editable));

    const contentStyle = maxHeight
        ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflowY: 'auto' as const }
        : undefined;

    return (
        <div ref={containerRef} className={`editor-container ${className ?? ''}`.trim()}>
            <LexicalComposer initialConfig={config.current}>
                {editable && <ToolbarPlugin />}
                <div className="editor-input group" style={{ position: 'relative', ...contentStyle }}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-content" />}
                        placeholder={<div className="editor-placeholder">{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    {editable && <FloatingTextFormatPlugin anchorElem={containerRef.current ?? undefined} />}
                    {editable && <FloatingLinkEditorPlugin anchorElem={containerRef.current ?? undefined} />}
                </div>
                <HistoryPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <LinkPlugin validateUrl={(url) => /^https?:\/\//.test(url) || /^mailto:/.test(url)} />
                {editable && <AutoLinkPlugin />}
                <CodePlugin />
                <TablePlugin hasCellMerge hasCellBackgroundColor />
                {editable && <TableActionMenuPlugin />}
                <HorizontalRulePlugin />
                {editable && <MarkdownPlugin />}
                {editable && <SlashCommandPlugin />}
                {editable && <DraggableBlockPlugin anchorElem={containerRef.current ?? undefined} />}
                <HtmlPlugin value={value} onChange={onChange} />
                <EditablePlugin editable={editable} />
                <CopyCodePlugin />
                {showWordCount && <WordCountPlugin />}
            </LexicalComposer>
        </div>
    );
}
