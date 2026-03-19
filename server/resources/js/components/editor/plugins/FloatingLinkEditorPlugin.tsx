import {
    $isAutoLinkNode,
    $isLinkNode,
    TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    KEY_ESCAPE_COMMAND,
    SELECTION_CHANGE_COMMAND,
    type LexicalEditor,
} from 'lexical';
import { Check, ExternalLink, Pencil, Trash2, X } from 'lucide-react';
import { type JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSelectedNode } from '../utils/getSelectedNode';
import { sanitizeUrl } from '../utils/url';

function FloatingLinkEditor({
    editor,
    isLink,
    setIsLink,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
}: {
    editor: LexicalEditor;
    isLink: boolean;
    setIsLink: (isLink: boolean) => void;
    anchorElem: HTMLElement;
    isLinkEditMode: boolean;
    setIsLinkEditMode: (isEditMode: boolean) => void;
}): JSX.Element | null {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [editedLinkUrl, setEditedLinkUrl] = useState('https://');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lastSelection, setLastSelection] = useState<any>(null);

    const $updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkParent = $findMatchingParent(node, $isLinkNode);

            if (linkParent) {
                setLinkUrl(linkParent.getURL());
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl('');
            }
            if (isLinkEditMode)
                setEditedLinkUrl(
                    linkParent
                        ? linkParent.getURL()
                        : $isLinkNode(node)
                          ? node.getURL()
                          : 'https://',
                );
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) return;
        const rootElement = editor.getRootElement();

        if (
            isLink &&
            selection !== null &&
            nativeSelection !== null &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode) &&
            editor.isEditable()
        ) {
            const domRect =
                nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
            if (domRect) {
                domRect.y += 40;
                positionEditorElement(editorElem, domRect, anchorElem);
            }
            setLastSelection(selection);
        } else if (!activeElement || activeElement.className !== 'link-input') {
            if (rootElement !== null)
                positionEditorElement(editorElem, null, anchorElem);
            setLastSelection(null);
            setIsLinkEditMode(false);
            setLinkUrl('');
        }
    }, [anchorElem, editor, isLink, isLinkEditMode, setIsLinkEditMode]);

    useEffect(() => {
        const scrollerElem = anchorElem.parentElement;
        const update = () => {
            editor.getEditorState().read(() => $updateLinkEditor());
        };
        window.addEventListener('resize', update);
        if (scrollerElem) scrollerElem.addEventListener('scroll', update);
        return () => {
            window.removeEventListener('resize', update);
            if (scrollerElem)
                scrollerElem.removeEventListener('scroll', update);
        };
    }, [anchorElem.parentElement, editor, $updateLinkEditor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => $updateLinkEditor());
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateLinkEditor();
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    if (isLink) {
                        setIsLink(false);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [editor, $updateLinkEditor, setIsLink, isLink]);

    useEffect(() => {
        editor.getEditorState().read(() => $updateLinkEditor());
    }, [editor, $updateLinkEditor, isLinkEditMode]);

    useEffect(() => {
        if (isLinkEditMode && inputRef.current) inputRef.current.focus();
    }, [isLinkEditMode, isLink]);

    const monitorInputInteraction = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleLinkSubmission();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsLinkEditMode(false);
        }
    };

    const handleLinkSubmission = () => {
        if (lastSelection !== null) {
            if (linkUrl !== '') {
                editor.dispatchCommand(
                    TOGGLE_LINK_COMMAND,
                    sanitizeUrl(editedLinkUrl),
                );
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const parent = getSelectedNode(selection).getParent();
                        if ($isAutoLinkNode(parent)) {
                            const linkNode = parent;
                            linkNode.setURL(editedLinkUrl);
                        }
                    }
                });
            }
            setEditedLinkUrl('https://');
            setIsLinkEditMode(false);
        }
    };

    return (
        <div
            ref={editorRef}
            className="link-editor absolute z-50 flex items-center gap-1.5 rounded-lg border bg-popover px-2 py-1.5 shadow-md"
        >
            {isLink &&
                (isLinkEditMode ? (
                    <>
                        <input
                            ref={inputRef}
                            className="link-input min-w-[200px] flex-1 bg-transparent text-sm outline-none"
                            value={editedLinkUrl}
                            onChange={(e) => setEditedLinkUrl(e.target.value)}
                            onKeyDown={monitorInputInteraction}
                        />
                        <button
                            type="button"
                            tabIndex={0}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                setEditedLinkUrl('https://');
                                setIsLinkEditMode(false);
                            }}
                            className="rounded p-1 hover:bg-accent"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            tabIndex={0}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleLinkSubmission}
                            className="rounded p-1 text-primary hover:bg-accent"
                        >
                            <Check className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : (
                    <>
                        <a
                            href={sanitizeUrl(linkUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="max-w-[200px] truncate text-sm text-primary underline"
                        >
                            {linkUrl}
                        </a>
                        <button
                            type="button"
                            tabIndex={0}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                setEditedLinkUrl(linkUrl);
                                setIsLinkEditMode(true);
                            }}
                            className="rounded p-1 hover:bg-accent"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            tabIndex={0}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                editor.dispatchCommand(
                                    TOGGLE_LINK_COMMAND,
                                    null,
                                );
                                setIsLink(false);
                            }}
                            className="rounded p-1 text-destructive hover:bg-accent"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <a
                            href={sanitizeUrl(linkUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 hover:bg-accent"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </>
                ))}
        </div>
    );
}

function positionEditorElement(
    editor: HTMLElement,
    rect: DOMRect | null,
    anchorElem: HTMLElement,
): void {
    if (rect === null) {
        editor.style.opacity = '0';
        editor.style.top = '-1000px';
        editor.style.left = '-1000px';
    } else {
        const anchorRect = anchorElem.getBoundingClientRect();
        editor.style.opacity = '1';
        // rect is viewport-relative; subtract anchorElem viewport position, add its scroll offset
        editor.style.top = `${rect.top + rect.height - anchorRect.top + anchorElem.scrollTop}px`;
        editor.style.left = `${rect.left - anchorRect.left + anchorElem.scrollLeft}px`;
    }
}

function useFloatingLinkEditorToolbar(
    editor: LexicalEditor,
    anchorElem: HTMLElement,
    isLinkEditMode: boolean,
    setIsLinkEditMode: (isEditMode: boolean) => void,
): JSX.Element | null {
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isLink, setIsLink] = useState(false);

    useEffect(() => {
        function $updateToolbar() {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const focusNode = getSelectedNode(selection);
                const focusLinkNode = $findMatchingParent(
                    focusNode,
                    $isLinkNode,
                );
                const focusAutoLinkNode = $findMatchingParent(
                    focusNode,
                    $isAutoLinkNode,
                );
                if (!(focusAutoLinkNode || focusLinkNode)) {
                    setIsLink(false);
                    return;
                }
                const badNode = selection
                    .getNodes()
                    .filter((node) => !$isLinkNode(node))
                    .find((node) => {
                        const linkNode = $findMatchingParent(node, $isLinkNode);
                        const autoLinkNode = $findMatchingParent(
                            node,
                            $isAutoLinkNode,
                        );
                        return !(linkNode || autoLinkNode);
                    });
                setIsLink(!badNode);
            }
        }
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => $updateToolbar());
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    $updateToolbar();
                    setActiveEditor(newEditor);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand(
                CLICK_COMMAND,
                (payload) => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const node = getSelectedNode(selection);
                        const linkNode = $findMatchingParent(node, $isLinkNode);
                        if (
                            $isLinkNode(linkNode) &&
                            (payload.metaKey || payload.ctrlKey)
                        ) {
                            window.open(linkNode.getURL(), '_blank');
                            return true;
                        }
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor]);

    return createPortal(
        <FloatingLinkEditor
            editor={activeEditor}
            isLink={isLink}
            anchorElem={anchorElem}
            setIsLink={setIsLink}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
        />,
        anchorElem,
    );
}

export default function FloatingLinkEditorPlugin({
    anchorElem = document.body,
    isLinkEditMode,
    setIsLinkEditMode,
}: {
    anchorElem?: HTMLElement;
    isLinkEditMode: boolean;
    setIsLinkEditMode: (isEditMode: boolean) => void;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    return useFloatingLinkEditorToolbar(
        editor,
        anchorElem,
        isLinkEditMode,
        setIsLinkEditMode,
    );
}
