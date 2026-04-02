import { $isCodeNode, getLanguageFriendlyName } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import type { CodeActionMenuPluginProps } from './CodeActionMenuPlugin.types';

const CODE_PADDING = 8;

function CodeActionMenuContainer({
    anchorElem,
}: {
    anchorElem: HTMLElement;
}): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [lang, setLang] = useState('');
    const [isShown, setShown] = useState<boolean>(false);
    const [shouldListenMouseMove, setShouldListenMouseMove] =
        useState<boolean>(false);
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const _codeSetRef = useRef<Set<string>>(new Set());
    const codeDOMNodeRef = useRef<HTMLElement | null>(null);
    const [isCopyCompleted, setCopyCompleted] = useState<boolean>(false);

    function getMouseInfo(event: MouseEvent): {
        codeDOMNode: HTMLElement | null;
        isOutside: boolean;
    } {
        const target = event.target as Node;
        if (target && target.nodeType === Node.ELEMENT_NODE) {
            const elem = target as Element;
            const codeDOMNode = elem.closest<HTMLElement>('code.editor-code');
            const isOutside = !(
                codeDOMNode ||
                elem.closest<HTMLElement>('div.code-action-menu-container')
            );
            return { codeDOMNode, isOutside };
        }
        return { codeDOMNode: null, isOutside: true };
    }

    useEffect(() => {
        if (!shouldListenMouseMove) return;
        function handleMouseMove(e: MouseEvent) {
            const { codeDOMNode, isOutside } = getMouseInfo(e);
            if (isOutside) {
                setShown(false);
                setShouldListenMouseMove(false);
                return;
            }
            if (codeDOMNode && codeDOMNode !== codeDOMNodeRef.current) {
                codeDOMNodeRef.current = codeDOMNode;
                editor.getEditorState().read(() => {
                    const maybeCodeNode =
                        $getNearestNodeFromDOMNode(codeDOMNode);
                    if ($isCodeNode(maybeCodeNode)) {
                        const language = maybeCodeNode.getLanguage() as string;
                        setLang(
                            language ? getLanguageFriendlyName(language) : '',
                        );
                    }
                });
            }
        }

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [shouldListenMouseMove, editor]);

    useEffect(() => {
        function handleMouseEnter(e: MouseEvent) {
            const { codeDOMNode, isOutside } = getMouseInfo(e);
            if (isOutside) return;
            const rect = codeDOMNode?.getBoundingClientRect();
            if (!rect) return;
            setShown(true);
            const anchorRect = anchorElem.getBoundingClientRect();
            const y = rect.y - anchorRect.y + anchorElem.scrollTop;
            const x = rect.x - anchorRect.x + rect.width - CODE_PADDING * 6;
            setPosition({ x, y });
            codeDOMNodeRef.current = codeDOMNode;
            setShouldListenMouseMove(true);
        }

        const codeBlocks =
            anchorElem.querySelectorAll<HTMLElement>('code.editor-code');
        codeBlocks.forEach((block) =>
            block.addEventListener('mouseenter', handleMouseEnter),
        );
        return () =>
            codeBlocks.forEach((block) =>
                block.removeEventListener('mouseenter', handleMouseEnter),
            );
    }, [anchorElem]);

    const handleCopy = useCallback(() => {
        const codeDOMNode = codeDOMNodeRef.current;
        if (!codeDOMNode) return;
        const textContent = codeDOMNode.textContent;
        if (textContent) {
            navigator.clipboard.writeText(textContent);
            setCopyCompleted(true);
            setTimeout(() => setCopyCompleted(false), 2000);
        }
    }, []);

    if (!isShown) return <></>;

    return (
        <div
            className="code-action-menu-container absolute z-10 flex items-center gap-1"
            style={{ top: position.y + CODE_PADDING, right: CODE_PADDING }}
        >
            {lang && (
                <span className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {lang}
                </span>
            )}
            <button
                type="button"
                onClick={handleCopy}
                className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground shadow-sm hover:bg-muted"
                title="Copy code"
            >
                {isCopyCompleted ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </button>
        </div>
    );
}

export default function CodeActionMenuPlugin({
    anchorElem = document.body,
}: CodeActionMenuPluginProps): JSX.Element {
    return createPortal(
        <CodeActionMenuContainer anchorElem={anchorElem} />,
        anchorElem,
    );
}
