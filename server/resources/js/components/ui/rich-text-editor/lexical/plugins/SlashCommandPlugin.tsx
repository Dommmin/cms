/**
 * SlashCommandPlugin
 * Type "/" at the start of an empty line to open a block-type command menu.
 */

import { $createCodeNode } from '@lexical/code';
import {
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    KEY_ESCAPE_COMMAND,
    KEY_ARROW_UP_COMMAND,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ENTER_COMMAND,
    COMMAND_PRIORITY_HIGH,
} from 'lexical';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type JSX,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// ─── Command definitions ──────────────────────────────────────────────────────

type CommandItem = {
    id: string;
    label: string;
    description: string;
    keywords: string[];
    icon: string;
};

const COMMANDS: CommandItem[] = [
    { id: 'p', label: 'Paragraph', description: 'Plain text', keywords: ['paragraph', 'text', 'p'], icon: 'P' },
    { id: 'h1', label: 'Heading 1', description: 'Large heading', keywords: ['heading', 'h1', 'title'], icon: 'H1' },
    { id: 'h2', label: 'Heading 2', description: 'Medium heading', keywords: ['heading', 'h2', 'subtitle'], icon: 'H2' },
    { id: 'h3', label: 'Heading 3', description: 'Small heading', keywords: ['heading', 'h3'], icon: 'H3' },
    { id: 'h4', label: 'Heading 4', description: 'Heading 4', keywords: ['heading', 'h4'], icon: 'H4' },
    { id: 'quote', label: 'Quote', description: 'Blockquote', keywords: ['quote', 'blockquote'], icon: '"' },
    { id: 'code', label: 'Code Block', description: 'Code with syntax highlighting', keywords: ['code', 'pre', 'snippet'], icon: '</>' },
    { id: 'bullet', label: 'Bullet List', description: 'Unordered list', keywords: ['bullet', 'list', 'ul'], icon: '•' },
    { id: 'number', label: 'Numbered List', description: 'Ordered list', keywords: ['number', 'ordered', 'ol', 'list'], icon: '1.' },
    { id: 'check', label: 'Check List', description: 'Todo checklist', keywords: ['check', 'todo', 'task'], icon: '✓' },
    { id: 'hr', label: 'Divider', description: 'Horizontal rule', keywords: ['divider', 'hr', 'line', 'rule', 'separator'], icon: '—' },
    { id: 'table', label: 'Table', description: '3×3 table', keywords: ['table', 'grid'], icon: '⊞' },
];

function filterCommands(query: string): CommandItem[] {
    if (!query) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(
        (c) =>
            c.label.toLowerCase().includes(q) ||
            c.keywords.some((k) => k.includes(q)),
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Remove the "/" trigger text from the current text node */
function removeSlashTrigger(editor: ReturnType<typeof useLexicalComposerContext>[0]) {
    editor.update(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return;

        const node = sel.anchor.getNode();
        if (!$isTextNode(node)) return;

        const text = node.getTextContent();
        const offset = sel.anchor.offset;

        // Find the "/" before the cursor
        const slashIndex = text.lastIndexOf('/', offset);
        if (slashIndex === -1) return;

        // Delete from "/" to cursor
        node.spliceText(slashIndex, offset - slashIndex, '', true);
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SlashCommandPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const filtered = filterCommands(query);

    // Clamp selectedIndex when filtered list changes
     
    useEffect(() => {
        setSelectedIndex((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
    }, [filtered.length]);

    // ─── Track keystrokes to detect "/" trigger ──────────────────────────────

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const sel = $getSelection();
                if (!$isRangeSelection(sel) || !sel.isCollapsed()) {
                    setOpen(false);
                    return;
                }

                const node = sel.anchor.getNode();
                if (!$isTextNode(node)) {
                    setOpen(false);
                    return;
                }

                const text = node.getTextContent();
                const offset = sel.anchor.offset;
                const textBeforeCursor = text.slice(0, offset);

                // Find last "/" in text before cursor
                const slashIndex = textBeforeCursor.lastIndexOf('/');
                if (slashIndex === -1) {
                    setOpen(false);
                    return;
                }

                // Only open if "/" is at start of the text node (possibly preceded by whitespace)
                const beforeSlash = textBeforeCursor.slice(0, slashIndex).trimEnd();
                if (beforeSlash.length > 0) {
                    setOpen(false);
                    return;
                }

                const afterSlash = textBeforeCursor.slice(slashIndex + 1);
                // Only alphanumeric chars after "/"
                if (/[^a-z0-9 ]/i.test(afterSlash)) {
                    setOpen(false);
                    return;
                }

                setQuery(afterSlash.trimStart());
                setOpen(true);

                // Position menu near cursor using DOM caret
                const domSelection = window.getSelection();
                if (domSelection && domSelection.rangeCount > 0) {
                    const range = domSelection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
                }
            });
        });
    }, [editor]);

    // ─── Apply a command ─────────────────────────────────────────────────────

    const applyCommand = useCallback(
        (item: CommandItem) => {
            removeSlashTrigger(editor);

            switch (item.id) {
                case 'p':
                    editor.update(() => {
                        const sel = $getSelection();
                        if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createParagraphNode());
                    });
                    break;
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                    editor.update(() => {
                        const sel = $getSelection();
                        if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createHeadingNode(item.id as 'h1' | 'h2' | 'h3' | 'h4'));
                    });
                    break;
                case 'quote':
                    editor.update(() => {
                        const sel = $getSelection();
                        if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createQuoteNode());
                    });
                    break;
                case 'code':
                    editor.update(() => {
                        const sel = $getSelection();
                        if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createCodeNode());
                    });
                    break;
                case 'bullet':
                    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                    break;
                case 'number':
                    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                    break;
                case 'check':
                    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
                    break;
                case 'hr':
                    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
                    break;
                case 'table':
                    editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: '3', columns: '3', includeHeaders: true });
                    break;
            }

            setOpen(false);
            setQuery('');
        },
        [editor],
    );

    // ─── Keyboard navigation when open ───────────────────────────────────────

    useEffect(() => {
        if (!open) return;

        const unregisterUp = editor.registerCommand(
            KEY_ARROW_UP_COMMAND,
            () => {
                setSelectedIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );

        const unregisterDown = editor.registerCommand(
            KEY_ARROW_DOWN_COMMAND,
            () => {
                setSelectedIndex((i) => (i >= filtered.length - 1 ? 0 : i + 1));
                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );

        const unregisterEnter = editor.registerCommand(
            KEY_ENTER_COMMAND,
            () => {
                const item = filtered[selectedIndex];
                if (item) {
                    applyCommand(item);
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_HIGH,
        );

        const unregisterEscape = editor.registerCommand(
            KEY_ESCAPE_COMMAND,
            () => {
                setOpen(false);
                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );

        return () => {
            unregisterUp();
            unregisterDown();
            unregisterEnter();
            unregisterEscape();
        };
    }, [open, editor, filtered, selectedIndex, applyCommand]);

    // ─── Scroll selected item into view ──────────────────────────────────────

    useLayoutEffect(() => {
        const el = menuRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!open || !menuPos || filtered.length === 0) return null;

    const menuWidth = 256;
    const x = Math.min(menuPos.x, window.innerWidth - menuWidth - 8);
    const y = Math.min(menuPos.y, window.innerHeight - 300 - 8);

    return createPortal(
        <div
            ref={menuRef}
            style={{ position: 'fixed', left: x, top: y, zIndex: 9999, width: menuWidth }}
            className="max-h-72 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-lg"
        >
            <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Blocks
            </div>
            {filtered.map((item, index) => (
                <button
                    key={item.id}
                    type="button"
                    data-selected={index === selectedIndex}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        applyCommand(item);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                        'flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors hover:bg-accent',
                        index === selectedIndex && 'bg-accent',
                    )}
                >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-border bg-background text-[11px] font-bold text-muted-foreground">
                        {item.icon}
                    </span>
                    <span className="flex flex-col">
                        <span className="text-xs font-medium">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground">{item.description}</span>
                    </span>
                </button>
            ))}
        </div>,
        document.body,
    );
}
