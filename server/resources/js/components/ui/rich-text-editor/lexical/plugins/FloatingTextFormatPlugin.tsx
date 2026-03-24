import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { Bold, Code2, Italic, Link2, Link2Off, Strikethrough, Underline } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { Toggle } from '@/components/ui/toggle';
import type { FormatState } from './FloatingTextFormatPlugin.types';

function FloatingToolbar({ editor, anchorElem }: { editor: ReturnType<typeof useLexicalComposerContext>[0]; anchorElem: HTMLElement }): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [formats, setFormats] = useState<FormatState>({ isBold: false, isItalic: false, isUnderline: false, isStrikethrough: false, isCode: false, isLink: false });

    const updateFloatingToolbar = useCallback(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || selection.isCollapsed()) {
            setIsVisible(false);
            return;
        }

        // Check all nodes in selection are text nodes
        const nodes = selection.getNodes();
        const hasOnlyText = nodes.every((n) => $isTextNode(n) || $isLinkNode(n));
        if (!hasOnlyText) { setIsVisible(false); return; }

        const nativeSel = window.getSelection();
        if (!nativeSel || nativeSel.rangeCount === 0 || !ref.current) {
            setIsVisible(false);
            return;
        }

        const domRange = nativeSel.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        if (rect.width === 0) { setIsVisible(false); return; }

        const editorRect = anchorElem.getBoundingClientRect();
        const top = rect.top - editorRect.top + anchorElem.scrollTop - (ref.current.offsetHeight || 40) - 8;
        const left = Math.max(0, Math.min(rect.left - editorRect.left + rect.width / 2 - (ref.current.offsetWidth || 240) / 2, editorRect.width - (ref.current.offsetWidth || 240)));
        ref.current.style.top = `${top}px`;
        ref.current.style.left = `${left}px`;

        const anchorNode = selection.anchor.getNode();
        const linkParent = $findMatchingParent(anchorNode, $isLinkNode);

        setFormats({
            isBold: selection.hasFormat('bold'),
            isItalic: selection.hasFormat('italic'),
            isUnderline: selection.hasFormat('underline'),
            isStrikethrough: selection.hasFormat('strikethrough'),
            isCode: selection.hasFormat('code'),
            isLink: $isLinkNode(linkParent) || $isLinkNode(anchorNode),
        });
        setIsVisible(true);
    }, [anchorElem]);

    useEffect(() => {
        const onResize = () => editor.getEditorState().read(updateFloatingToolbar);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [editor, updateFloatingToolbar]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => updateFloatingToolbar());
            }),
            editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
                updateFloatingToolbar();
                return false;
            }, COMMAND_PRIORITY_LOW),
        );
    }, [editor, updateFloatingToolbar]);

    const insertLink = () => {
        if (!formats.isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: 'https://', target: '_blank' });
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    };

    if (!isVisible) return <></>;

    return (
        <div
            ref={ref}
            className="absolute z-50 flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-lg"
            style={{ position: 'absolute' }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <Toggle
                size="sm" className="h-7 w-7 p-0" pressed={formats.isBold}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                title="Bold (Ctrl+B)"
            >
                <Bold size={13} />
            </Toggle>
            <Toggle
                size="sm" className="h-7 w-7 p-0" pressed={formats.isItalic}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                title="Italic (Ctrl+I)"
            >
                <Italic size={13} />
            </Toggle>
            <Toggle
                size="sm" className="h-7 w-7 p-0" pressed={formats.isUnderline}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                title="Underline (Ctrl+U)"
            >
                <Underline size={13} />
            </Toggle>
            <Toggle
                size="sm" className="h-7 w-7 p-0" pressed={formats.isStrikethrough}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                title="Strikethrough"
            >
                <Strikethrough size={13} />
            </Toggle>
            <Toggle
                size="sm" className="h-7 w-7 p-0" pressed={formats.isCode}
                onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
                title="Inline code"
            >
                <Code2 size={13} />
            </Toggle>
            <div className="mx-0.5 h-5 w-px bg-border" />
            <Toggle
                size="sm" className="h-7 w-7 p-0" pressed={formats.isLink}
                onPressedChange={insertLink}
                title="Insert / remove link"
            >
                {formats.isLink ? <Link2Off size={13} /> : <Link2 size={13} />}
            </Toggle>
        </div>
    );
}

export default function FloatingTextFormatPlugin({ anchorElem }: { anchorElem?: HTMLElement }): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [container, setContainer] = useState<HTMLElement | null>(null);

     
     
    useEffect(() => {
        setContainer(anchorElem ?? editor.getRootElement()?.parentElement ?? document.body); // eslint-disable-line react-hooks/set-state-in-effect
    }, [editor, anchorElem]);

    if (!container) return <></>;
    return createPortal(<FloatingToolbar editor={editor} anchorElem={container} />, container);
}
