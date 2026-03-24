import { $isCodeNode, CODE_LANGUAGE_FRIENDLY_NAME_MAP, CODE_LANGUAGE_MAP, getDefaultCodeLanguage } from '@lexical/code';
import { $createCodeNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
    $isListNode,
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListNode,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { $getSelectionStyleValueForProperty, $patchStyleText, $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import type {
    ElementNode} from 'lexical';
import {
    $createParagraphNode,
    $getSelection,
    $insertNodes,
    $isElementNode,
    $isRangeSelection,
    $isTextNode,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
    type ElementFormatType,
} from 'lexical';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    CheckSquare,
    ChevronDown,
    Code2,
    Eraser,
    Highlighter,
    Image,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Minus,
    Pilcrow,
    Plus,
    Quote,
    Redo2,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    Underline,
    Undo2,
    Youtube,
    SpellCheck,
    Baseline,
    Smile,
    Hash,
    Columns2,
    Columns3,
    ChevronRight,
} from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { MediaPickerModal } from '@/components/media-picker-modal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { $createImageNode } from '../../image-node';
import { $createYouTubeNode, extractYouTubeId } from '../../youtube-node';
import { $createCollapsibleContainerNode, $createCollapsibleTitleNode, $createCollapsibleContentNode } from '../collapsible-nodes';
import { $createLayoutContainerNode, $createLayoutItemNode } from '../layout-nodes';
import type { BlockType, InsertDialog, ToolbarState } from './ToolbarPlugin.types';

// ─── Types ────────────────────────────────────────────────────────────────────

const ELEMENT_FORMAT_NUM_TO_TYPE: Record<number, ElementFormatType> = {
    0: '',
    1: 'left',
    2: 'start',
    3: 'center',
    4: 'right',
    5: 'end',
    6: 'justify',
} as const;

// ─── Helper components ────────────────────────────────────────────────────────

function Btn({
    onClick,
    disabled,
    tooltip,
    children,
    className = '',
}: {
    onClick: () => void;
    disabled?: boolean;
    tooltip: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${className}`}
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={tooltip}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
        </Tooltip>
    );
}

function Tog({
    pressed,
    onPressedChange,
    tooltip,
    children,
    className = '',
}: {
    pressed: boolean;
    onPressedChange: () => void;
    tooltip: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle
                    type="button"
                    size="sm"
                    className={`h-7 w-7 p-0 ${className}`}
                    pressed={pressed}
                    onPressedChange={onPressedChange}
                    aria-label={tooltip}
                >
                    {children}
                </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
        </Tooltip>
    );
}

function Sep() {
    return <Separator orientation="vertical" className="mx-1 h-5" />;
}

// ─── Block type config ────────────────────────────────────────────────────────

const BLOCK_LABELS: Record<BlockType, string> = {
    paragraph: 'Paragraph',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    quote: 'Quote',
    code: 'Code Block',
    bullet: 'Bullet List',
    number: 'Numbered List',
    check: 'Check List',
};

const BLOCK_ICONS: Record<BlockType, JSX.Element> = {
    paragraph: <Pilcrow size={14} />,
    h1: <span className="text-xs font-bold">H1</span>,
    h2: <span className="text-xs font-bold">H2</span>,
    h3: <span className="text-xs font-bold">H3</span>,
    h4: <span className="text-xs font-bold">H4</span>,
    h5: <span className="text-xs font-bold">H5</span>,
    h6: <span className="text-xs font-bold">H6</span>,
    quote: <Quote size={14} />,
    code: <Code2 size={14} />,
    bullet: <List size={14} />,
    number: <ListOrdered size={14} />,
    check: <CheckSquare size={14} />,
};

// ─── Font / color constants ───────────────────────────────────────────────────

const FONT_SIZES = [10, 11, 12, 14, 15, 16, 18, 24, 30, 36];

const FONT_FAMILIES: Array<[string, string]> = [
    ['', 'Default'],
    ['serif', 'Serif'],
    ['monospace', 'Mono'],
    ['cursive', 'Cursive'],
];

const TEXT_COLORS = [
    '#000000', '#374151', '#6b7280', '#9ca3af',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
    '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
    '#0d9488', '#2563eb', '#7c3aed', '#db2777',
    '#ffffff', '#f3f4f6', '#dbeafe', '#dcfce7',
];

// ─── Emoji data ───────────────────────────────────────────────────────────────

const EMOJIS: Array<{ label: string; emojis: string[] }> = [
    { label: 'Smileys', emojis: ['😀','😂','😊','😍','😎','😢','😡','🥰','🤔','😅','🤣','😇','🙂','😏','😒','😔','🤯','🥺','😤','😈'] },
    { label: 'Gestures', emojis: ['👍','👎','👏','🙏','🤝','✌️','👌','🤞','☝️','👊','💪','🤙','🖐️','👋','🤜','🤛'] },
    { label: 'Hearts', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❤️‍🔥','💕','💞','💓','💗','💖','💝'] },
    { label: 'Objects', emojis: ['🔥','⭐','✨','💡','🎉','🎊','🎁','🏆','🎯','🔑','💎','🛡️','⚡','💰','📌','✅','❌','⚠️','🔔','📢'] },
    { label: 'Nature', emojis: ['🌟','🌈','☀️','🌙','⛅','🌊','🌺','🌸','🍀','🌻','🌹','🦋','🐶','🐱','🦁','🐻','🦊','🐼','🌿','🍁'] },
    { label: 'Food', emojis: ['🍕','🍔','🍦','🍩','🍭','🎂','☕','🍵','🍺','🥂','🍷','🥗','🍜','🌮','🍣','🥐','🍓','🍇','🍊','🥑'] },
    { label: 'Activity', emojis: ['⚽','🏀','🎮','🎵','🎸','🎨','✈️','🚀','🏠','💻','📱','📷','🎬','🎭','🎪','🏋️','🎯','🏄','🧗','🎲'] },
];

// ─── Special characters ───────────────────────────────────────────────────────

const SPECIAL_CHARS: Array<{ label: string; chars: Array<{ char: string; name: string }> }> = [
    {
        label: 'Typography',
        chars: [
            { char: '©', name: 'Copyright' }, { char: '®', name: 'Registered' }, { char: '™', name: 'Trademark' },
            { char: '°', name: 'Degree' }, { char: '±', name: 'Plus-Minus' }, { char: '×', name: 'Multiply' },
            { char: '÷', name: 'Divide' }, { char: '≠', name: 'Not Equal' }, { char: '≤', name: 'Less or Equal' },
            { char: '≥', name: 'Greater or Equal' }, { char: '∞', name: 'Infinity' }, { char: '≈', name: 'Almost Equal' },
            { char: '\u2026', name: 'Ellipsis' }, { char: '\u2014', name: 'Em Dash' }, { char: '\u2013', name: 'En Dash' },
            { char: '\u201C', name: 'Left Quote' }, { char: '\u201D', name: 'Right Quote' }, { char: '\u2018', name: 'Left Single' },
            { char: '\u2019', name: 'Right Single' }, { char: '«', name: 'Left Guillemet' }, { char: '»', name: 'Right Guillemet' },
        ],
    },
    {
        label: 'Currency',
        chars: [
            { char: '€', name: 'Euro' }, { char: '£', name: 'Pound' }, { char: '¥', name: 'Yen' },
            { char: '¢', name: 'Cent' }, { char: '₹', name: 'Rupee' }, { char: '₿', name: 'Bitcoin' },
            { char: '₽', name: 'Ruble' }, { char: '₩', name: 'Won' }, { char: '₪', name: 'Shekel' },
            { char: '₫', name: 'Dong' }, { char: '₺', name: 'Lira' }, { char: '฿', name: 'Baht' },
        ],
    },
    {
        label: 'Arrows',
        chars: [
            { char: '→', name: 'Right Arrow' }, { char: '←', name: 'Left Arrow' }, { char: '↑', name: 'Up Arrow' },
            { char: '↓', name: 'Down Arrow' }, { char: '↔', name: 'Left-Right Arrow' }, { char: '↕', name: 'Up-Down Arrow' },
            { char: '⇒', name: 'Right Double Arrow' }, { char: '⇐', name: 'Left Double Arrow' },
            { char: '⇔', name: 'Double Arrow' }, { char: '↩', name: 'Return Arrow' }, { char: '↪', name: 'Right Hook' },
            { char: '➜', name: 'Bold Right' }, { char: '✓', name: 'Check Mark' }, { char: '✗', name: 'Cross Mark' },
        ],
    },
    {
        label: 'Math',
        chars: [
            { char: 'π', name: 'Pi' }, { char: 'Σ', name: 'Sigma' }, { char: 'Δ', name: 'Delta' },
            { char: 'Ω', name: 'Omega' }, { char: 'μ', name: 'Mu' }, { char: 'α', name: 'Alpha' },
            { char: 'β', name: 'Beta' }, { char: 'γ', name: 'Gamma' }, { char: '√', name: 'Square Root' },
            { char: '∑', name: 'Sum' }, { char: '∫', name: 'Integral' }, { char: '∂', name: 'Partial' },
            { char: '∅', name: 'Empty Set' }, { char: '∈', name: 'Element Of' }, { char: '∩', name: 'Intersection' },
            { char: '∪', name: 'Union' },
        ],
    },
];

// ─── Code languages ───────────────────────────────────────────────────────────

const CODE_LANGUAGES = Object.entries(CODE_LANGUAGE_MAP)
    .reduce<Array<[string, string]>>((acc, [key]) => {
        const normalized = CODE_LANGUAGE_MAP[key];
        if (!acc.find(([k]) => k === normalized)) {
            acc.push([normalized, CODE_LANGUAGE_FRIENDLY_NAME_MAP[normalized] ?? normalized]);
        }
        return acc;
    }, [])
    .sort(([, a], [, b]) => a.localeCompare(b));

// ─── Main component ───────────────────────────────────────────────────────────

export default function ToolbarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();

    const [state, setState] = useState<ToolbarState>({
        canUndo: false,
        canRedo: false,
        blockType: 'paragraph',
        elementFormat: '',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
        isCode: false,
        isSubscript: false,
        isSuperscript: false,
        isHighlight: false,
        isLink: false,
        codeLanguage: '',
        fontSize: '15px',
        fontFamily: '',
        fontColor: '',
    });

    const [insertDialog, setInsertDialog] = useState<InsertDialog>(null);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [ytUrl, setYtUrl] = useState('');
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);

    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const anchorNode = selection.anchor.getNode();
            const rawElement = anchorNode.getKey() === 'root'
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow();

            if (!$isElementNode(rawElement)) return;
            const element = rawElement;

            // Block type
            let blockType: BlockType = 'paragraph';
            let codeLanguage = '';
            if ($isListNode(element)) {
                const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
                const type = (parentList ?? element).getListType();
                blockType = type === 'bullet' ? 'bullet' : type === 'number' ? 'number' : 'check';
            } else if ($isHeadingNode(element)) {
                blockType = element.getTag() as BlockType;
            } else if ($isQuoteNode(element)) {
                blockType = 'quote';
            } else if ($isCodeNode(element)) {
                blockType = 'code';
                codeLanguage = element.getLanguage() ?? getDefaultCodeLanguage();
            }

            // Pre-compute all values synchronously inside read() before passing to setState
            const elementFormat = ELEMENT_FORMAT_NUM_TO_TYPE[element.getFormat()] ?? '';
            const isBold = selection.hasFormat('bold');
            const isItalic = selection.hasFormat('italic');
            const isUnderline = selection.hasFormat('underline');
            const isStrikethrough = selection.hasFormat('strikethrough');
            const isCode = selection.hasFormat('code');
            const isSubscript = selection.hasFormat('subscript');
            const isSuperscript = selection.hasFormat('superscript');
            const isHighlight = selection.hasFormat('highlight');

            const node = anchorNode;
            const parent = node.getParent();
            const isLink = $isLinkNode(parent) || $isLinkNode(node);

            const fontSize = $getSelectionStyleValueForProperty(selection, 'font-size', '15px');
            const fontFamily = $getSelectionStyleValueForProperty(selection, 'font-family', '');
            const fontColor = $getSelectionStyleValueForProperty(selection, 'color', '');

            setState((prev) => ({
                ...prev,
                blockType,
                codeLanguage,
                elementFormat,
                isBold,
                isItalic,
                isUnderline,
                isStrikethrough,
                isCode,
                isSubscript,
                isSuperscript,
                isHighlight,
                isLink,
                fontSize,
                fontFamily,
                fontColor,
            }));
        });
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(() => { updateToolbar(); }),
            editor.registerCommand(SELECTION_CHANGE_COMMAND, () => { updateToolbar(); return false; }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(CAN_UNDO_COMMAND, (payload) => { setState((p) => ({ ...p, canUndo: payload })); return false; }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(CAN_REDO_COMMAND, (payload) => { setState((p) => ({ ...p, canRedo: payload })); return false; }, COMMAND_PRIORITY_LOW),
        );
    }, [editor, updateToolbar]);

    // ─── Block formatting ──────────────────────────────────────────────────────

    const formatParagraph = useCallback(() => {
        editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createParagraphNode());
        });
    }, [editor]);

    const formatHeading = useCallback((tag: HeadingTagType) => {
        if (state.blockType !== tag) {
            editor.update(() => {
                const sel = $getSelection();
                if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createHeadingNode(tag));
            });
        } else {
            formatParagraph();
        }
    }, [editor, state.blockType, formatParagraph]);

    const formatQuote = useCallback(() => {
        if (state.blockType !== 'quote') {
            editor.update(() => {
                const sel = $getSelection();
                if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createQuoteNode());
            });
        } else {
            formatParagraph();
        }
    }, [editor, state.blockType, formatParagraph]);

    const formatCode = useCallback(() => {
        if (state.blockType !== 'code') {
            editor.update(() => {
                const sel = $getSelection();
                if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createCodeNode());
            });
        } else {
            formatParagraph();
        }
    }, [editor, state.blockType, formatParagraph]);

    const formatBullet = useCallback(() => {
        if (state.blockType !== 'bullet') editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        else formatParagraph();
    }, [editor, state.blockType, formatParagraph]);

    const formatNumber = useCallback(() => {
        if (state.blockType !== 'number') editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        else formatParagraph();
    }, [editor, state.blockType, formatParagraph]);

    const formatCheck = useCallback(() => {
        if (state.blockType !== 'check') editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        else formatParagraph();
    }, [editor, state.blockType, formatParagraph]);

    const onBlockTypeSelect = (type: BlockType) => {
        switch (type) {
            case 'paragraph': formatParagraph(); break;
            case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
                formatHeading(type as HeadingTagType); break;
            case 'quote': formatQuote(); break;
            case 'code': formatCode(); break;
            case 'bullet': formatBullet(); break;
            case 'number': formatNumber(); break;
            case 'check': formatCheck(); break;
        }
    };

    // ─── Code language ─────────────────────────────────────────────────────────

    const onCodeLanguageSelect = useCallback((lang: string) => {
        editor.update(() => {
            const sel = $getSelection();
            if (!$isRangeSelection(sel)) return;
            const node = sel.anchor.getNode().getTopLevelElementOrThrow();
            if ($isCodeNode(node)) node.setLanguage(lang);
        });
    }, [editor]);

    // ─── Clear formatting ──────────────────────────────────────────────────────

    const clearFormatting = useCallback(() => {
        editor.update(() => {
            const sel = $getSelection();
            if (!$isRangeSelection(sel)) return;
            for (const node of sel.getNodes()) {
                if ($isTextNode(node)) node.setFormat(0);
            }
        });
    }, [editor]);

    // ─── Font styles ───────────────────────────────────────────────────────────

    const applyStyleText = useCallback((style: Record<string, string>) => {
        editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) $patchStyleText(sel, style);
        });
    }, [editor]);

    // ─── Spellcheck ────────────────────────────────────────────────────────────

    const [spellcheck, setSpellcheck] = useState(false);

    const toggleSpellcheck = useCallback(() => {
        setSpellcheck((prev) => {
            const next = !prev;
            const root = editor.getRootElement();
            if (root) root.spellcheck = next;
            return next;
        });
    }, [editor]);

    // ─── Link ──────────────────────────────────────────────────────────────────

    const toggleLink = useCallback(() => {
        if (!state.isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: 'https://', target: '_blank' });
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, state.isLink]);

    // ─── Insert ────────────────────────────────────────────────────────────────

    const pendingSelectionRef = useRef<ReturnType<typeof $getSelection>>(null);

    const openMediaPicker = useCallback(() => {
        // Capture current selection before the editor loses focus
        editor.getEditorState().read(() => {
            pendingSelectionRef.current = $getSelection();
        });
        setMediaPickerOpen(true);
    }, [editor]);

    const handleMediaSelect = useCallback((media: { url: string; name: string }) => {
        editor.update(() => {
            const node = $createImageNode({ src: media.url, altText: media.name });
            $insertNodes([node]);
        });
        setMediaPickerOpen(false);
    }, [editor]);

    const handleInsertYoutube = () => {
        const videoId = extractYouTubeId(ytUrl.trim());
        if (!videoId) return;
        editor.update(() => {
            $insertNodes([$createYouTubeNode(videoId)]);
        });
        setYtUrl('');
        setInsertDialog(null);
    };

    const handleInsertTable = () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: String(Math.max(1, tableRows)),
            columns: String(Math.max(1, tableCols)),
            includeHeaders: true,
        });
        setInsertDialog(null);
    };

    const handleInsertEmoji = useCallback((emoji: string) => {
        editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) sel.insertText(emoji);
        });
        setInsertDialog(null);
    }, [editor]);

    const handleInsertColumns = useCallback((templateColumns: string) => {
        editor.update(() => {
            const colCount = templateColumns.split(' ').length;
            const container = $createLayoutContainerNode(templateColumns);
            for (let i = 0; i < colCount; i++) {
                const item = $createLayoutItemNode();
                const paragraph = $createParagraphNode();
                item.append(paragraph);
                container.append(item);
            }
            $insertNodes([container]);
            ((container.getFirstChild() as ElementNode | null)?.getFirstChild() as ElementNode | null)?.select();
        });
    }, [editor]);

    const handleInsertCollapsible = useCallback(() => {
        editor.update(() => {
            const container = $createCollapsibleContainerNode(true);
            const title = $createCollapsibleTitleNode();
            const titleParagraph = $createParagraphNode();
            title.append(titleParagraph);
            const content = $createCollapsibleContentNode();
            const contentParagraph = $createParagraphNode();
            content.append(contentParagraph);
            container.append(title, content);
            $insertNodes([container]);
            titleParagraph.select();
        });
    }, [editor]);

    // ─── Render ────────────────────────────────────────────────────────────────

    const { canUndo, canRedo, blockType, elementFormat, isBold, isItalic, isUnderline, isStrikethrough, isCode, isSubscript, isSuperscript, isHighlight, isLink, codeLanguage, fontSize, fontFamily, fontColor } = state;

    return (
        <TooltipProvider delayDuration={300}>
            <div className="editor-toolbar" role="toolbar" aria-label="Editor toolbar">

                {/* History */}
                <Btn onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} disabled={!canUndo} tooltip="Undo (Ctrl+Z)">
                    <Undo2 size={14} />
                </Btn>
                <Btn onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} disabled={!canRedo} tooltip="Redo (Ctrl+Shift+Z)">
                    <Redo2 size={14} />
                </Btn>

                <Sep />

                {/* Block type */}
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal">
                                    {BLOCK_ICONS[blockType]}
                                    <span className="hidden sm:inline">{BLOCK_LABELS[blockType]}</span>
                                    <ChevronDown size={12} className="opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Block type</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent className="w-44">
                        {(['paragraph', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'code', 'bullet', 'number', 'check'] as BlockType[]).map((type) => (
                            <Fragment key={type}>
                                {(type === 'quote' || type === 'bullet') && <DropdownMenuSeparator />}
                                <DropdownMenuItem onClick={() => onBlockTypeSelect(type)} className={`gap-2 text-xs ${blockType === type ? 'bg-accent' : ''}`}>
                                    <span className="flex w-4 items-center justify-center">{BLOCK_ICONS[type]}</span>
                                    {BLOCK_LABELS[type]}
                                </DropdownMenuItem>
                            </Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Code language selector */}
                {blockType === 'code' && (
                    <>
                        <Sep />
                        <Select value={codeLanguage} onValueChange={onCodeLanguageSelect}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SelectTrigger className="h-7 w-28 text-xs">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">Code language</TooltipContent>
                            </Tooltip>
                            <SelectContent>
                                {CODE_LANGUAGES.map(([lang, label]) => (
                                    <SelectItem key={lang} value={lang} className="text-xs">{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                )}

                <Sep />

                {/* Text format */}
                <Tog pressed={isBold} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} tooltip="Bold (Ctrl+B)">
                    <Bold size={13} />
                </Tog>
                <Tog pressed={isItalic} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} tooltip="Italic (Ctrl+I)">
                    <Italic size={13} />
                </Tog>
                <Tog pressed={isUnderline} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} tooltip="Underline (Ctrl+U)">
                    <Underline size={13} />
                </Tog>
                <Tog pressed={isStrikethrough} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} tooltip="Strikethrough">
                    <Strikethrough size={13} />
                </Tog>
                <Tog pressed={isCode} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')} tooltip="Inline code">
                    <Code2 size={13} />
                </Tog>
                <Tog pressed={isSubscript} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')} tooltip="Subscript">
                    <Subscript size={13} />
                </Tog>
                <Tog pressed={isSuperscript} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')} tooltip="Superscript">
                    <Superscript size={13} />
                </Tog>
                <Tog pressed={isHighlight} onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')} tooltip="Highlight">
                    <Highlighter size={13} />
                </Tog>
                <Btn onClick={clearFormatting} tooltip="Clear formatting">
                    <Eraser size={13} />
                </Btn>

                <Sep />

                {/* Font size */}
                <Select value={fontSize} onValueChange={(val) => applyStyleText({ 'font-size': val })}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SelectTrigger className="h-7 w-14 px-1.5 text-xs">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Font size</TooltipContent>
                    </Tooltip>
                    <SelectContent>
                        {FONT_SIZES.map((size) => (
                            <SelectItem key={size} value={`${size}px`} className="text-xs">{size}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Font family */}
                <Select
                    value={fontFamily || '__default__'}
                    onValueChange={(val) => applyStyleText({ 'font-family': val === '__default__' ? '' : val })}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SelectTrigger className="h-7 w-20 px-1.5 text-xs">
                                <SelectValue placeholder="Font" />
                            </SelectTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Font family</TooltipContent>
                    </Tooltip>
                    <SelectContent>
                        {FONT_FAMILIES.map(([value, label]) => (
                            <SelectItem key={value || '__default__'} value={value || '__default__'} className="text-xs">{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Text color */}
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="relative h-7 w-7 p-0">
                                    <Baseline size={13} />
                                    <span
                                        className="absolute bottom-0.5 left-1 right-1 h-0.5 rounded-full"
                                        style={{ backgroundColor: fontColor || 'currentColor' }}
                                    />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Text color</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent className="p-2">
                        <div className="grid grid-cols-8 gap-1">
                            {TEXT_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className="h-5 w-5 rounded border border-border transition-transform hover:scale-110"
                                    style={{ backgroundColor: color }}
                                    onClick={() => applyStyleText({ color })}
                                    title={color}
                                />
                            ))}
                        </div>
                        <DropdownMenuSeparator className="my-1.5" />
                        <button
                            type="button"
                            className="w-full py-0.5 text-center text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => applyStyleText({ color: '' })}
                        >
                            Reset color
                        </button>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Spellcheck */}
                <Tog pressed={spellcheck} onPressedChange={toggleSpellcheck} tooltip="Spellcheck">
                    <SpellCheck size={13} />
                </Tog>

                <Sep />

                {/* Alignment */}
                <Tog pressed={elementFormat === 'left'} onPressedChange={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} tooltip="Align left">
                    <AlignLeft size={13} />
                </Tog>
                <Tog pressed={elementFormat === 'center'} onPressedChange={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} tooltip="Align center">
                    <AlignCenter size={13} />
                </Tog>
                <Tog pressed={elementFormat === 'right'} onPressedChange={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} tooltip="Align right">
                    <AlignRight size={13} />
                </Tog>
                <Tog pressed={elementFormat === 'justify'} onPressedChange={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} tooltip="Justify">
                    <AlignJustify size={13} />
                </Tog>

                <Sep />

                {/* Link */}
                <Tog pressed={isLink} onPressedChange={toggleLink} tooltip={isLink ? 'Remove link' : 'Insert link'}>
                    {isLink ? <Link2Off size={13} /> : <Link2 size={13} />}
                </Tog>

                <Sep />

                {/* Insert */}
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-normal">
                                    <Plus size={13} />
                                    <span className="hidden sm:inline">Insert</span>
                                    <ChevronDown size={12} className="opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Insert element</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent>
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}>
                            <Minus size={14} /> Horizontal Rule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-xs" onClick={openMediaPicker}>
                            <Image size={14} /> Image
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => { setYtUrl(''); setInsertDialog('youtube'); }}>
                            <Youtube size={14} /> YouTube Video
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => { setTableRows(3); setTableCols(3); setInsertDialog('table'); }}>
                            <Table size={14} /> Table
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => handleInsertColumns('1fr 1fr')}>
                            <Columns2 size={14} /> 2 Columns
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => handleInsertColumns('1fr 1fr 1fr')}>
                            <Columns3 size={14} /> 3 Columns
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs" onClick={handleInsertCollapsible}>
                            <ChevronRight size={14} /> Collapsible Section
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => setInsertDialog('emoji')}>
                            <Smile size={14} /> Emoji
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => setInsertDialog('special')}>
                            <Hash size={14} /> Special Characters
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* ─── Media Picker (Insert Image) ─────────────────────────────────────── */}
            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={(media) => handleMediaSelect({ url: media.url, name: media.name })}
                onReorder={() => {}}
                onRemove={() => {}}
                onSetThumbnail={() => {}}
                selectedImages={[]}
                multiple={false}
            />

            {/* ─── Insert YouTube Dialog ───────────────────────────────────────────── */}
            <Dialog open={insertDialog === 'youtube'} onOpenChange={(o) => { if (!o) setInsertDialog(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Insert YouTube Video</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="yt-url" className="text-xs">YouTube URL</Label>
                            <Input
                                id="yt-url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={ytUrl}
                                onChange={(e) => setYtUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInsertYoutube()}
                                autoFocus
                            />
                        </div>
                        {ytUrl && !extractYouTubeId(ytUrl) && (
                            <p className="text-xs text-destructive">Invalid YouTube URL</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setInsertDialog(null)}>Cancel</Button>
                        <Button type="button" onClick={handleInsertYoutube} disabled={!ytUrl.trim() || !extractYouTubeId(ytUrl)}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Insert Table Dialog ─────────────────────────────────────────────── */}
            <Dialog open={insertDialog === 'table'} onOpenChange={(o) => { if (!o) setInsertDialog(null); }}>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle>Insert Table</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="tbl-rows" className="text-xs">Rows</Label>
                            <Input
                                id="tbl-rows"
                                type="number"
                                min={1}
                                max={20}
                                value={tableRows}
                                onChange={(e) => setTableRows(Number(e.target.value))}
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="tbl-cols" className="text-xs">Columns</Label>
                            <Input
                                id="tbl-cols"
                                type="number"
                                min={1}
                                max={10}
                                value={tableCols}
                                onChange={(e) => setTableCols(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setInsertDialog(null)}>Cancel</Button>
                        <Button type="button" onClick={handleInsertTable}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Insert Special Characters Dialog ───────────────────────────────── */}
            <Dialog open={insertDialog === 'special'} onOpenChange={(o) => { if (!o) setInsertDialog(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Special Characters</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-72 overflow-y-auto space-y-3 py-1">
                        {SPECIAL_CHARS.map((group) => (
                            <div key={group.label}>
                                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {group.label}
                                </div>
                                <div className="flex flex-wrap gap-0.5">
                                    {group.chars.map(({ char, name }) => (
                                        <button
                                            key={`${group.label}-${char}`}
                                            type="button"
                                            title={name}
                                            onClick={() => handleInsertEmoji(char)}
                                            className="flex h-8 w-8 items-center justify-center rounded font-mono text-sm transition-colors hover:bg-accent"
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ─── Insert Emoji Dialog ──────────────────────────────────────────────── */}
            <Dialog open={insertDialog === 'emoji'} onOpenChange={(o) => { if (!o) setInsertDialog(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Insert Emoji</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-72 overflow-y-auto space-y-3 py-1">
                        {EMOJIS.map((group) => (
                            <div key={group.label}>
                                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {group.label}
                                </div>
                                <div className="flex flex-wrap gap-0.5">
                                    {group.emojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleInsertEmoji(emoji)}
                                            className="h-8 w-8 rounded text-lg transition-colors hover:bg-accent"
                                            title={emoji}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
