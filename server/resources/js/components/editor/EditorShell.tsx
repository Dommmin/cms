import { TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { type JSX } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import DatePlugin from './plugins/DatePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatPlugin from './plugins/FloatingTextFormatPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import LayoutPlugin from './plugins/LayoutPlugin/LayoutPlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import type { EditorShellProps } from './EditorShell.types';

const isDev = process.env.NODE_ENV === 'development';

export default function EditorShell({
    showTreeView = false,
    placeholder = 'Enter some rich text…',
    className,
}: EditorShellProps): JSX.Element {
    const { historyState } = useSharedHistoryContext();
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    return (
        <div
            className={cn(
                'editor-shell relative rounded-lg border bg-card shadow-sm',
                className,
            )}
        >
            {/* Toolbar */}
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />

            {/* Editor Content Area */}
            <div className="editor-container relative">
                <div ref={onRef} className="editor-inner relative">
                    <RichTextPlugin
                        contentEditable={<ContentEditable />}
                        placeholder={<Placeholder>{placeholder}</Placeholder>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />

                    {/* Built-in Plugins */}
                    <HistoryPlugin externalHistoryState={historyState} />
                    <AutoFocusPlugin />
                    <ClearEditorPlugin />
                    <ListPlugin />
                    <CheckListPlugin />
                    <TablePlugin hasCellMerge hasCellBackgroundColor />
                    <HorizontalRulePlugin />
                    <TabIndentationPlugin />
                    <HashtagPlugin />
                    <LinkPlugin
                        validateUrl={(url: string) => {
                            try {
                                return [
                                    'http:',
                                    'https:',
                                    'mailto:',
                                    'tel:',
                                ].includes(new URL(url).protocol);
                            } catch {
                                return (
                                    /^https?:\/\//.test(url) ||
                                    /^mailto:/.test(url) ||
                                    /^tel:/.test(url)
                                );
                            }
                        }}
                    />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

                    {/* Custom Plugins */}
                    <AutoLinkPlugin />
                    <CodeHighlightPlugin />
                    <DatePlugin />
                    <ImagesPlugin />
                    <YouTubePlugin />
                    <TwitterPlugin />
                    <FigmaPlugin />
                    <PageBreakPlugin />
                    <LayoutPlugin />
                    <CollapsiblePlugin />
                    <ComponentPickerPlugin />

                    {/* Floating plugins need anchor elem */}
                    {floatingAnchorElem && (
                        <>
                            <DraggableBlockPlugin
                                anchorElem={floatingAnchorElem}
                            />
                            <CodeActionMenuPlugin
                                anchorElem={floatingAnchorElem}
                            />
                            <FloatingLinkEditorPlugin
                                anchorElem={floatingAnchorElem}
                                isLinkEditMode={isLinkEditMode}
                                setIsLinkEditMode={setIsLinkEditMode}
                            />
                            <FloatingTextFormatPlugin
                                setIsLinkEditMode={setIsLinkEditMode}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Dev Tree View */}
            {isDev && showTreeView && (
                <div className="border-t">
                    {/* TreeViewPlugin loaded lazily in dev */}
                </div>
            )}

            {/* Actions Bar */}
            <ActionsPlugin />
        </div>
    );
}
