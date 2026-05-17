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
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { MediaPickerModal } from '@/components/media-picker-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import { $createImageNode } from '../../image-node';
import { $createYouTubeNode, extractYouTubeId } from '../../youtube-node';
import { $createCollapsibleContainerNode, $createCollapsibleTitleNode, $createCollapsibleContentNode } from '../collapsible-nodes';
import { $createLayoutContainerNode, $createLayoutItemNode } from '../layout-nodes';
import { getEditorLinkTarget, isAllowedEditorLinkUrl, normalizeEditorLinkUrl } from '../link-url';
import { CODE_LANGUAGES, ELEMENT_FORMAT_NUM_TO_TYPE } from './ToolbarPlugin.constants';
import { ToolbarSeparator as Sep } from './ToolbarPlugin.controls';
import { EmojiDialog, LinkDialog, SpecialCharactersDialog, TableDialog, YouTubeDialog } from './ToolbarPlugin.dialogs';
import { AlignmentGroup, FontStyleGroup, HistoryGroup, InlineFormatGroup, LinkGroup } from './ToolbarPlugin.groups';
import { BlockTypeMenu, InsertMenu } from './ToolbarPlugin.menus';
import type { BlockType, InsertDialog, ToolbarPluginProps, ToolbarState } from './ToolbarPlugin.types';

// ─── Main component ───────────────────────────────────────────────────────────

export default function ToolbarPlugin({ mode = 'full' }: ToolbarPluginProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const __ = useTranslation();
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
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
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
            setLinkUrl('');
            setLinkDialogOpen(true);
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, state.isLink]);

    const handleInsertLink = useCallback(() => {
        const normalizedUrl = normalizeEditorLinkUrl(linkUrl);

        if (!isAllowedEditorLinkUrl(normalizedUrl)) return;

        editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
            url: normalizedUrl,
            target: getEditorLinkTarget(normalizedUrl),
        });
        setLinkDialogOpen(false);
        setLinkUrl('');
    }, [editor, linkUrl]);

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
            <div className="editor-toolbar" role="toolbar" aria-label={__('rte.toolbar.label', 'Editor toolbar')}>

                <HistoryGroup
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    onRedo={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                />

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
                                        <SelectValue placeholder={__('rte.toolbar.language', 'Language')} />
                                    </SelectTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">{__('rte.toolbar.code_language', 'Code language')}</TooltipContent>
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

                <InlineFormatGroup
                    showAdvanced={isFullMode}
                    isBold={isBold}
                    isItalic={isItalic}
                    isUnderline={isUnderline}
                    isStrikethrough={isStrikethrough}
                    isCode={isCode}
                    isSubscript={isSubscript}
                    isSuperscript={isSuperscript}
                    isHighlight={isHighlight}
                    onBold={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                    onItalic={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                    onUnderline={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                    onStrikethrough={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                    onCode={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
                    onSubscript={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
                    onSuperscript={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
                    onHighlight={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
                    onClearFormatting={clearFormatting}
                />
                {isFullMode && (
                    <>
                        <Sep />

                        <FontStyleGroup
                            fontSize={fontSize}
                            fontFamily={fontFamily}
                            fontColor={fontColor}
                            spellcheck={spellcheck}
                            onFontSizeChange={(val) => applyStyleText({ 'font-size': val })}
                            onFontFamilyChange={(val) => applyStyleText({ 'font-family': val === '__default__' ? '' : val })}
                            onFontColorChange={(color) => applyStyleText({ color })}
                            onResetColor={() => applyStyleText({ color: '' })}
                            onToggleSpellcheck={toggleSpellcheck}
                        />

                        <Sep />

                        <AlignmentGroup
                            elementFormat={elementFormat}
                            onAlignLeft={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                            onAlignCenter={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                            onAlignRight={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                            onJustify={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
                        />

                        <Sep />
                    </>
                )}

                <LinkGroup isLink={isLink} onToggleLink={toggleLink} />

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

            <LinkDialog
                open={linkDialogOpen}
                url={linkUrl}
                isInvalid={linkUrl.trim() !== '' && !isAllowedEditorLinkUrl(linkUrl)}
                onOpenChange={(open) => {
                    setLinkDialogOpen(open);
                    if (!open) setLinkUrl('');
                }}
                onUrlChange={setLinkUrl}
                onInsert={handleInsertLink}
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
