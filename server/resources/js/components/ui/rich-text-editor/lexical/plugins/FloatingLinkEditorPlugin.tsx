import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    KEY_ESCAPE_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { ExternalLink, Link2Off, Pencil, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function getSelectedNode(selection: ReturnType<typeof $getSelection>) {
    if (!$isRangeSelection(selection)) return null;
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = anchor.getNode();
    const focusNode = focus.getNode();
    if (anchorNode === focusNode) return anchorNode;
    return selection.isBackward() ? focusNode : anchorNode;
}

function FloatingLinkEditor({ editor, anchorElem }: { editor: ReturnType<typeof useLexicalComposerContext>[0]; anchorElem: HTMLElement }): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [url, setUrl] = useState('');
    const [editUrl, setEditUrl] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const updatePosition = useCallback(() => {
        const nativeSel = window.getSelection();
        if (!nativeSel || nativeSel.rangeCount === 0 || !ref.current) return;
        const domRange = nativeSel.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        const editorRect = anchorElem.getBoundingClientRect();
        const top = rect.bottom - editorRect.top + anchorElem.scrollTop + 6;
        const left = Math.max(0, Math.min(rect.left - editorRect.left, editorRect.width - 300));
        ref.current.style.top = `${top}px`;
        ref.current.style.left = `${left}px`;
    }, [anchorElem]);

    const update = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            const node = getSelectedNode(selection);
            if (!node) { setIsVisible(false); return; }
            const linkParent = $findMatchingParent(node, $isLinkNode);
            const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);
            if (autoLinkParent) { setIsVisible(false); return; }
            if (linkParent) {
                setUrl(linkParent.getURL());
                setIsVisible(true);
                setTimeout(updatePosition, 0);
            } else if ($isLinkNode(node)) {
                setUrl(node.getURL());
                setIsVisible(true);
                setTimeout(updatePosition, 0);
            } else {
                setIsVisible(false);
            }
        });
    }, [editor, updatePosition]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => update());
            }),
            editor.registerCommand(SELECTION_CHANGE_COMMAND, () => { update(); return false; }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(CLICK_COMMAND, () => { update(); return false; }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => { if (isVisible) { setIsVisible(false); return true; } return false; },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [editor, update, isVisible]);

    useEffect(() => {
        if (isEdit && inputRef.current) inputRef.current.focus();
    }, [isEdit]);

    const handleSave = () => {
        if (editUrl.trim()) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: editUrl.trim(), target: '_blank' });
        }
        setIsEdit(false);
    };

    if (!isVisible) return <></>;

    return (
        <div
            ref={ref}
            className="absolute z-50 flex items-center gap-1 rounded-lg border bg-popover p-1.5 shadow-lg"
            style={{ position: 'absolute' }}
            onMouseDown={(e) => e.preventDefault()}
        >
            {isEdit ? (
                <>
                    <Input
                        ref={inputRef}
                        className="h-7 w-56 text-xs"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                            if (e.key === 'Escape') { e.preventDefault(); setIsEdit(false); }
                        }}
                        placeholder="https://"
                    />
                    <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSave}>Save</Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEdit(false)}><X size={12} /></Button>
                </>
            ) : (
                <>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="max-w-52 truncate px-1 text-xs text-primary hover:underline">{url}</a>
                    <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        title="Edit link"
                        onClick={() => { setEditUrl(url); setIsEdit(true); }}
                    >
                        <Pencil size={12} />
                    </Button>
                    <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        title="Open in new tab"
                        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    >
                        <ExternalLink size={12} />
                    </Button>
                    <Button
                        size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Remove link"
                        onClick={() => { editor.dispatchCommand(TOGGLE_LINK_COMMAND, null); setIsVisible(false); }}
                    >
                        <Link2Off size={12} />
                    </Button>
                </>
            )}
        </div>
    );
}

export default function FloatingLinkEditorPlugin({ anchorElem }: { anchorElem?: HTMLElement }): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [container, setContainer] = useState<HTMLElement | null>(null);

     
    useEffect(() => {
        setContainer(anchorElem ?? editor.getRootElement()?.parentElement ?? document.body);
    }, [editor, anchorElem]);

    if (!container) return <></>;
    return createPortal(<FloatingLinkEditor editor={editor} anchorElem={container} />, container);
}
