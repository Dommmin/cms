import { $createCodeNode, $isCodeNode, getDefaultCodeLanguage } from '@lexical/code';
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
import type { ElementNode } from 'lexical';
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
} from 'lexical';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Baseline,
    Bold,
    Code2,
    Eraser,
    Highlighter,
    Italic,
    Link2,
    Link2Off,
    Redo2,
    SpellCheck,
    Strikethrough,
    Subscript,
    Superscript,
    Underline,
    Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { MediaPickerModal } from '@/components/media-picker-modal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { $createImageNode } from '../../image-node';
import { $createYouTubeNode, extractYouTubeId } from '../../youtube-node';
import { $createCollapsibleContainerNode, $createCollapsibleTitleNode, $createCollapsibleContentNode } from '../collapsible-nodes';
import { $createLayoutContainerNode, $createLayoutItemNode } from '../layout-nodes';
import { CODE_LANGUAGES, ELEMENT_FORMAT_NUM_TO_TYPE, FONT_FAMILIES, FONT_SIZES, TEXT_COLORS } from './ToolbarPlugin.constants';
import { ToolbarButton as Btn, ToolbarSeparator as Sep, ToolbarToggle as Tog } from './ToolbarPlugin.controls';
import { EmojiDialog, SpecialCharactersDialog, TableDialog, YouTubeDialog } from './ToolbarPlugin.dialogs';
import { BlockTypeMenu, InsertMenu } from './ToolbarPlugin.menus';
import type { BlockType, InsertDialog, ToolbarPluginProps, ToolbarState } from './ToolbarPlugin.types';

// ─── Main component ───────────────────────────────────────────────────────────

export default function ToolbarPlugin({ mode = 'full' }: ToolbarPluginProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const isFullMode = mode === 'full';

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
                <BlockTypeMenu blockType={blockType} onSelect={onBlockTypeSelect} />

                {/* Code language selector */}
                {isFullMode && blockType === 'code' && (
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
                {isFullMode && (
                    <>
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
                                                className="absolute right-1 bottom-0.5 left-1 h-0.5 rounded-full"
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
                    </>
                )}

                {/* Link */}
                <Tog pressed={isLink} onPressedChange={toggleLink} tooltip={isLink ? 'Remove link' : 'Insert link'}>
                    {isLink ? <Link2Off size={13} /> : <Link2 size={13} />}
                </Tog>

                {isFullMode && (
                    <>
                        <Sep />

                        <InsertMenu
                            onInsertHorizontalRule={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
                            onOpenMediaPicker={openMediaPicker}
                            onOpenYouTubeDialog={() => {
                                setYtUrl('');
                                setInsertDialog('youtube');
                            }}
                            onOpenTableDialog={() => {
                                setTableRows(3);
                                setTableCols(3);
                                setInsertDialog('table');
                            }}
                            onInsertColumns={handleInsertColumns}
                            onInsertCollapsible={handleInsertCollapsible}
                            onOpenEmojiDialog={() => setInsertDialog('emoji')}
                            onOpenSpecialCharactersDialog={() => setInsertDialog('special')}
                        />
                    </>
                )}
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

            <YouTubeDialog
                open={insertDialog === 'youtube'}
                url={ytUrl}
                onOpenChange={(open) => {
                    if (!open) setInsertDialog(null);
                }}
                onUrlChange={setYtUrl}
                onInsert={handleInsertYoutube}
            />

            <TableDialog
                open={insertDialog === 'table'}
                rows={tableRows}
                columns={tableCols}
                onOpenChange={(open) => {
                    if (!open) setInsertDialog(null);
                }}
                onRowsChange={setTableRows}
                onColumnsChange={setTableCols}
                onInsert={handleInsertTable}
            />

            <SpecialCharactersDialog
                open={insertDialog === 'special'}
                onOpenChange={(open) => {
                    if (!open) setInsertDialog(null);
                }}
                onSelect={handleInsertEmoji}
            />

            <EmojiDialog
                open={insertDialog === 'emoji'}
                onOpenChange={(open) => {
                    if (!open) setInsertDialog(null);
                }}
                onSelect={handleInsertEmoji}
            />
        </TooltipProvider>
    );
}
