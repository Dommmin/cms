import { registerCodeHighlighting } from '@lexical/code';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useEffect, useMemo, useRef, type JSX } from 'react';
import type { EditorProps } from './Editor.types';
import { isAllowedEditorLinkUrl } from './link-url';
import { nodes } from './nodes';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import ClipboardImagePlugin from './plugins/ClipboardImagePlugin';
import ContentHealthPlugin from './plugins/ContentHealthPlugin';
import CopyCodePlugin from './plugins/CopyCodePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import ExportPlugin from './plugins/ExportPlugin';
import FindReplacePlugin from './plugins/FindReplacePlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatPlugin from './plugins/FloatingTextFormatPlugin';
import HtmlPlugin from './plugins/HtmlPlugin';
import MarkdownPlugin from './plugins/MarkdownPlugin';
import PasteSanitizerPlugin from './plugins/PasteSanitizerPlugin';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';
import SnippetsPlugin from './plugins/SnippetsPlugin';
import TableActionMenuPlugin from './plugins/TableActionMenuPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import WordCountPlugin from './plugins/WordCountPlugin';
import { theme } from './theme';

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

export default function Editor({ value, onChange, onJsonChange, placeholder = 'Start writing...', className, maxHeight, editable = true, mode = 'full', showWordCount = true, instanceKey }: EditorProps): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);
    const config = useMemo(() => buildConfig(editable), [editable]);
    const isFullMode = mode === 'full';

    const contentStyle = maxHeight
        ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflowY: 'auto' as const }
        : undefined;

    return (
            <div ref={containerRef} className={`editor-container ${className ?? ''}`.trim()}>
            <LexicalComposer initialConfig={config}>
                {editable && <ToolbarPlugin mode={mode} />}
                <div className="editor-input group" style={{ position: 'relative', ...contentStyle }}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-content" />}
                        placeholder={<div className="editor-placeholder">{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    {editable && <FloatingTextFormatPlugin />}
                    {editable && <FloatingLinkEditorPlugin />}
                </div>
                <HistoryPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <LinkPlugin validateUrl={isAllowedEditorLinkUrl} />
{editable && <AutoLinkPlugin />}
                <CodePlugin />
                <TablePlugin hasCellMerge hasCellBackgroundColor />
                {editable && <TableActionMenuPlugin />}
                <HorizontalRulePlugin />
                {editable && <MarkdownPlugin />}
                {editable && <PasteSanitizerPlugin />}
                {editable && <ClipboardImagePlugin />}
                {editable && <SlashCommandPlugin />}
                {editable && <SnippetsPlugin />}
                {editable && <DraggableBlockPlugin />}
                <HtmlPlugin value={value} onChange={onChange} onJsonChange={onJsonChange} instanceKey={instanceKey} />
                <EditablePlugin editable={editable} />
                <CopyCodePlugin />
                {editable && <ContentHealthPlugin />}
                {isFullMode && editable && <FindReplacePlugin />}
                {showWordCount && <WordCountPlugin />}
                {isFullMode && editable && <ExportPlugin />}
            </LexicalComposer>
        </div>
    );
}
