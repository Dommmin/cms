import './styles/editor.css';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import type { EditorState } from 'lexical';
import { useEffect, type JSX } from 'react';
import { cn } from '@/lib/utils';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import type { EditorProps } from './editor.types';
import EditorShell from './EditorShell';
import { nodes } from './nodes';
import { theme } from './theme';

// ─── InitialState Plugin ───────────────────────────────────────────────────────

function InitialStatePlugin({ value }: { value?: string }): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (!value) return;
        try {
            const state = editor.parseEditorState(JSON.parse(value));
            if (!state.isEmpty()) {
                queueMicrotask(() => editor.setEditorState(state));
            }
        } catch {
            console.warn('Editor: failed to parse initial state');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // only on mount
    return null;
}

// ─── EditorProps ────────────────────────────────────────────────────────────────────

// ─── Editor Component ──────────────────────────────────────────────────────────

export default function Editor({
    value,
    onChange,
    placeholder,
    className,
    showTreeView,
}: EditorProps): JSX.Element {
    const initialConfig = {
        namespace: 'lexical-editor',
        theme,
        nodes,
        onError(error: Error) {
            console.error('[Lexical Editor Error]', error);
        },
    };

    function handleChange(editorState: EditorState): void {
        const json = JSON.stringify(editorState.toJSON());
        onChange?.(json);
    }

    return (
        <div className={cn('w-full', className)}>
            <LexicalComposer initialConfig={initialConfig}>
                <SharedHistoryContext>
                    <EditorShell
                        placeholder={placeholder}
                        showTreeView={showTreeView}
                    />
                    {onChange && (
                        <OnChangePlugin
                            onChange={handleChange}
                            ignoreHistoryMergeTagChange
                            ignoreSelectionChange
                        />
                    )}
                    <InitialStatePlugin value={value} />
                </SharedHistoryContext>
            </LexicalComposer>
        </div>
    );
}
