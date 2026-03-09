import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import type { BaseSelection, LexicalEditor, NodeKey } from 'lexical';
import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    DRAGSTART_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { type JSX } from 'react';
import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { cn } from '@/lib/utils';
import ImageResizer from '../ui/ImageResizer';
import { $isImageNode } from './ImageNode';

interface Props {
    altText: string;
    caption: LexicalEditor;
    captionsEnabled: boolean;
    height: 'inherit' | number;
    maxWidth: number;
    nodeKey: NodeKey;
    resizable: boolean;
    showCaption: boolean;
    src: string;
    width: 'inherit' | number;
}

export default function ImageComponent({
    src,
    altText,
    nodeKey,
    width,
    height,
    maxWidth,
    resizable,
    showCaption,
    caption,
    captionsEnabled,
}: Props): JSX.Element {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isResizing, setIsResizing] = useState(false);
    const [editor] = useLexicalComposerContext();
    const [selection, setSelection] = useState<BaseSelection | null>(null);
    const activeEditorRef = useRef<LexicalEditor | null>(null);

    const onDelete = useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isImageNode(node)) node.remove();
                });
            }
            return false;
        },
        [editor, isSelected, nodeKey],
    );

    const onEnter = useCallback(
        (_event: KeyboardEvent) => {
            const latestSelection = $getSelection();
            if (
                isSelected &&
                $isNodeSelection(latestSelection) &&
                latestSelection.getNodes().length === 1
            ) {
                if (showCaption) {
                    clearSelection();
                    return true;
                }
            }
            return false;
        },
        [clearSelection, isSelected, showCaption],
    );

    const onEscape = useCallback(
        (event: KeyboardEvent) => {
            if (activeEditorRef.current === caption || buttonRef.current === event.target) {
                clearSelection();
                editor.update(() => {
                    setSelected(true);
                });
            }
            return false;
        },
        [caption, clearSelection, editor, setSelected],
    );

    useEffect(() => {
        let isMounted = true;
        const unregister = mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                if (isMounted) setSelection(editorState.read(() => $getSelection()));
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_, activeEditor) => {
                    activeEditorRef.current = activeEditor;
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CLICK_COMMAND,
                (payload) => {
                    const event = payload as MouseEvent;
                    if (isResizing) return true;
                    if (event.target === imageRef.current) {
                        if (event.shiftKey) {
                            setSelected(!isSelected);
                        } else {
                            clearSelection();
                            setSelected(true);
                        }
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    if (event.target === imageRef.current) {
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW),
        );
        return () => {
            isMounted = false;
            unregister();
        };
    }, [clearSelection, editor, isResizing, isSelected, nodeKey, onDelete, onEnter, onEscape, setSelected]);

    const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
        setTimeout(() => {
            setIsResizing(false);
        }, 200);
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) node.setWidthAndHeight(nextWidth, nextHeight);
        });
    };

    const onResizeStart = () => {
        setIsResizing(true);
    };

    const isFocused = isSelected || isResizing;

    return (
        <Suspense fallback={null}>
            <div className="relative inline-block">
                <img
                    ref={imageRef}
                    className={cn(
                        'max-w-full cursor-default rounded',
                        isFocused && 'outline outline-2 outline-primary outline-offset-1',
                    )}
                    src={src}
                    alt={altText}
                    style={{
                        height: height === 'inherit' ? 'auto' : height,
                        width: width === 'inherit' ? 'auto' : width,
                        maxWidth,
                    }}
                    draggable={false}
                />
                {resizable && isFocused && (
                    <ImageResizer
                        editor={editor}
                        buttonRef={buttonRef}
                        imageRef={imageRef as React.RefObject<HTMLElement>}
                        maxWidth={maxWidth}
                        onResizeStart={onResizeStart}
                        onResizeEnd={onResizeEnd}
                        captionsEnabled={captionsEnabled}
                    />
                )}
            </div>
            {showCaption && (
                <div className="block w-full px-2 py-1 text-center text-sm text-muted-foreground">
                    <Suspense fallback={null}>{/* caption editor would go here */}</Suspense>
                </div>
            )}
        </Suspense>
    );
}
