import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState, type JSX } from 'react';

interface ToolbarState {
    canUndo: boolean;
    canRedo: boolean;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    blockType: 'paragraph' | 'h1' | 'h2' | 'h3' | 'code';
}

function getSelectedBlockType(): ToolbarState['blockType'] {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
        return 'paragraph';
    }

    const anchorNode = selection.anchor.getNode();
    const topLevelNode =
        anchorNode.getKey() === 'root'
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();

    if ($isHeadingNode(topLevelNode)) {
        const tag = topLevelNode.getTag();

        if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
            return tag;
        }
    }

    if ($isCodeNode(topLevelNode)) {
        return 'code';
    }

    return 'paragraph';
}

export default function ToolbarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [state, setState] = useState<ToolbarState>({
        canUndo: false,
        canRedo: false,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
        blockType: 'paragraph',
    });

    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
                return;
            }

            setState((previous) => ({
                ...previous,
                isBold: selection.hasFormat('bold'),
                isItalic: selection.hasFormat('italic'),
                isUnderline: selection.hasFormat('underline'),
                isStrikethrough: selection.hasFormat('strikethrough'),
                blockType: getSelectedBlockType(),
            }));
        });
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => {
                updateToolbar();
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setState((previous) => ({ ...previous, canUndo: payload }));
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setState((previous) => ({ ...previous, canRedo: payload }));
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, updateToolbar]);

    const formatHeading = useCallback(
        (tag: 'h1' | 'h2' | 'h3') => {
            editor.update(() => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return;
                }

                $setBlocksType(selection, () => $createHeadingNode(tag));
            });

            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        },
        [editor],
    );

    const formatCodeBlock = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
                return;
            }

            $setBlocksType(selection, () => $createCodeNode());
        });
    }, [editor]);

    const toggleLink = useCallback(() => {
        const url = window.prompt('Enter URL');

        if (url === null) {
            return;
        }

        const normalizedUrl = url.trim();

        if (normalizedUrl.length === 0) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            return;
        }

        editor.dispatchCommand(TOGGLE_LINK_COMMAND, normalizedUrl);
    }, [editor]);

    return (
        <div className="editor-toolbar" role="toolbar" aria-label="Text formatting toolbar">
            <button
                className={`editor-button ${state.isBold ? 'editor-button-active' : ''}`}
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                aria-label="Bold"
            >
                B
            </button>
            <button
                className={`editor-button ${state.isItalic ? 'editor-button-active' : ''}`}
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                aria-label="Italic"
            >
                I
            </button>
            <button
                className={`editor-button ${state.isUnderline ? 'editor-button-active' : ''}`}
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                aria-label="Underline"
            >
                U
            </button>
            <button
                className={`editor-button ${state.isStrikethrough ? 'editor-button-active' : ''}`}
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                aria-label="Strikethrough"
            >
                S
            </button>
            <button
                className={`editor-button ${state.blockType === 'h1' ? 'editor-button-active' : ''}`}
                type="button"
                onClick={() => formatHeading('h1')}
                aria-label="Heading 1"
            >
                H1
            </button>
            <button
                className={`editor-button ${state.blockType === 'h2' ? 'editor-button-active' : ''}`}
                type="button"
                onClick={() => formatHeading('h2')}
                aria-label="Heading 2"
            >
                H2
            </button>
            <button
                className={`editor-button ${state.blockType === 'h3' ? 'editor-button-active' : ''}`}
                type="button"
                onClick={() => formatHeading('h3')}
                aria-label="Heading 3"
            >
                H3
            </button>
            <button
                className="editor-button"
                type="button"
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                aria-label="Bulleted list"
            >
                UL
            </button>
            <button
                className="editor-button"
                type="button"
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                aria-label="Numbered list"
            >
                OL
            </button>
            <button
                className={`editor-button ${state.blockType === 'code' ? 'editor-button-active' : ''}`}
                type="button"
                onClick={formatCodeBlock}
                aria-label="Code block"
            >
                {'</>'}
            </button>
            <button className="editor-button" type="button" onClick={toggleLink} aria-label="Insert link">
                Link
            </button>
            <button
                className="editor-button"
                type="button"
                onClick={() =>
                    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                        rows: '3',
                        columns: '3',
                        includeHeaders: true,
                    })
                }
                aria-label="Insert table"
            >
                Table
            </button>
            <button
                className="editor-button"
                type="button"
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                aria-label="Undo"
                disabled={!state.canUndo}
            >
                Undo
            </button>
            <button
                className="editor-button"
                type="button"
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                aria-label="Redo"
                disabled={!state.canRedo}
            >
                Redo
            </button>
        </div>
    );
}
