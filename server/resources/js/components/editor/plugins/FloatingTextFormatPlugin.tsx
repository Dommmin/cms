import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isParagraphNode,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {
    Bold,
    Code,
    Italic,
    Link,
    Strikethrough,
    Subscript,
    Superscript,
    Underline as UnderlineIcon,
} from 'lucide-react';
import { type JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toggle } from '@/components/ui/toggle';
import { getSelectedNode } from '../utils/getSelectedNode';

interface Position {
    top: number;
    left: number;
}

function TextFormatFloatingToolbar({
    editor,
    isLink,
    isBold,
    isItalic,
    isUnderline,
    isCode,
    isStrikethrough,
    isSubscript,
    isSuperscript,
    setIsLinkEditMode,
}: {
    editor: ReturnType<typeof useLexicalComposerContext>[0];
    isBold: boolean;
    isCode: boolean;
    isItalic: boolean;
    isLink: boolean;
    isStrikethrough: boolean;
    isSubscript: boolean;
    isSuperscript: boolean;
    isUnderline: boolean;
    setIsLinkEditMode: (isEditMode: boolean) => void;
}): JSX.Element {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Position | null>(null);

    const insertLink = useCallback(() => {
        if (!isLink) {
            setIsLinkEditMode(true);
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
        } else {
            setIsLinkEditMode(false);
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink, setIsLinkEditMode]);

    const updatePosition = useCallback(() => {
        const nativeSelection = window.getSelection();
        if (
            !nativeSelection ||
            nativeSelection.isCollapsed ||
            nativeSelection.rangeCount === 0
        ) {
            setPosition(null);
            return;
        }

        const rootElement = editor.getRootElement();
        if (!rootElement || !rootElement.contains(nativeSelection.anchorNode)) {
            setPosition(null);
            return;
        }

        const range = nativeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (!rect || (rect.width === 0 && rect.height === 0)) {
            setPosition(null);
            return;
        }

        const toolbar = toolbarRef.current;
        const toolbarHeight = toolbar ? toolbar.offsetHeight || 36 : 36;
        const toolbarWidth = toolbar ? toolbar.offsetWidth || 200 : 200;

        const GAP = 8;
        let top = 0;
        let left = 0;

        // position: fixed uses viewport coords — no scroll offset needed
        top = rect.top - toolbarHeight - GAP;
        left = rect.left + rect.width / 2 - toolbarWidth / 2;

        // flip below if not enough space above
        if (top < 4) {
            top = rect.bottom + GAP;
        }

        // clamp horizontally to viewport
        const maxLeft = window.innerWidth - toolbarWidth - 8;
        left = Math.max(8, Math.min(left, maxLeft));

        setPosition({ top, left });
    }, [editor]);

    useEffect(() => {
        const handleMouseUp = () => {
            // Small delay to allow selection to finalize
            setTimeout(updatePosition, 50);
        };
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [updatePosition]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => {
                editor.getEditorState().read(() => updatePosition());
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    setTimeout(updatePosition, 50);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, updatePosition]);

    const style: React.CSSProperties = position
        ? {
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 9999,
          }
        : {
              position: 'fixed',
              top: -9999,
              left: -9999,
              zIndex: 9999,
              opacity: 0,
          };

    return (
        <div
            ref={toolbarRef}
            style={style}
            className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-md"
            onMouseDown={(e) => e.preventDefault()}
        >
            {(
                [
                    { format: 'bold', icon: Bold, pressed: isBold },
                    { format: 'italic', icon: Italic, pressed: isItalic },
                    {
                        format: 'underline',
                        icon: UnderlineIcon,
                        pressed: isUnderline,
                    },
                    {
                        format: 'strikethrough',
                        icon: Strikethrough,
                        pressed: isStrikethrough,
                    },
                    {
                        format: 'subscript',
                        icon: Subscript,
                        pressed: isSubscript,
                    },
                    {
                        format: 'superscript',
                        icon: Superscript,
                        pressed: isSuperscript,
                    },
                    { format: 'code', icon: Code, pressed: isCode },
                ] as const
            ).map(({ format, icon: Icon, pressed }) => (
                <Toggle
                    key={format}
                    size="sm"
                    pressed={pressed}
                    onPressedChange={() =>
                        editor.dispatchCommand(
                            FORMAT_TEXT_COMMAND,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            format as any,
                        )
                    }
                    className="h-7 w-7 p-0"
                >
                    <Icon className="h-3.5 w-3.5" />
                </Toggle>
            ))}
            <div className="mx-0.5 h-4 w-px bg-border" />
            <Toggle
                size="sm"
                pressed={isLink}
                onPressedChange={insertLink}
                className="h-7 w-7 p-0"
            >
                <Link className="h-3.5 w-3.5" />
            </Toggle>
        </div>
    );
}

function useFloatingTextFormatToolbar(
    editor: ReturnType<typeof useLexicalComposerContext>[0],
    setIsLinkEditMode: (isEditMode: boolean) => void,
): JSX.Element | null {
    const [isText, setIsText] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isCode, setIsCode] = useState(false);

    const updatePopup = useCallback(() => {
        editor.getEditorState().read(() => {
            if (editor.isComposing()) return;

            const selection = $getSelection();
            const nativeSelection = window.getSelection();
            const rootElement = editor.getRootElement();

            if (
                nativeSelection !== null &&
                (!$isRangeSelection(selection) ||
                    rootElement === null ||
                    !rootElement.contains(nativeSelection.anchorNode))
            ) {
                setIsText(false);
                return;
            }

            if (!$isRangeSelection(selection)) return;

            const node = getSelectedNode(selection);
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));
            setIsCode(selection.hasFormat('code'));

            const parent = node.getParent();
            setIsLink($isLinkNode(parent) || $isLinkNode(node));

            if (
                !$isCodeHighlightNode(selection.anchor.getNode()) &&
                selection.getTextContent() !== ''
            ) {
                setIsText($isTextNode(node) || $isParagraphNode(node));
            } else {
                setIsText(false);
            }
        });
    }, [editor]);

    useEffect(() => {
        document.addEventListener('selectionchange', updatePopup);
        return () =>
            document.removeEventListener('selectionchange', updatePopup);
    }, [updatePopup]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => updatePopup()),
            editor.registerRootListener(() => {
                if (editor.getRootElement() === null) setIsText(false);
            }),
        );
    }, [editor, updatePopup]);

    if (!isText) return null;

    return createPortal(
        <TextFormatFloatingToolbar
            editor={editor}
            isLink={isLink}
            isBold={isBold}
            isItalic={isItalic}
            isStrikethrough={isStrikethrough}
            isSubscript={isSubscript}
            isSuperscript={isSuperscript}
            isUnderline={isUnderline}
            isCode={isCode}
            setIsLinkEditMode={setIsLinkEditMode}
        />,
        document.body,
    );
}

export default function FloatingTextFormatPlugin({
    setIsLinkEditMode,
}: {
    anchorElem?: HTMLElement;
    setIsLinkEditMode: (isEditMode: boolean) => void;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    return useFloatingTextFormatToolbar(editor, setIsLinkEditMode);
}
