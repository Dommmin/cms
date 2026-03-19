import {
    $isCodeNode,
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
    normalizeCodeLang,
} from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import {
    $getSelectionStyleValueForProperty,
    $patchStyleText,
} from '@lexical/selection';
import {
    $findMatchingParent,
    $getNearestNodeOfType,
    mergeRegister,
} from '@lexical/utils';
import {
    $getNodeByKey,
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
    type ElementFormatType,
    type NodeKey,
} from 'lexical';
import {
    Redo2,
    Undo2,
    Link,
    Unlink,
    Baseline,
    Highlighter,
} from 'lucide-react';
import { type JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSharedHistoryContext } from '../../context/SharedHistoryContext';
import type { BlockType } from '../../context/ToolbarContext';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import AlignDropdown from './AlignDropdown';
import BlockFormatDropdown from './BlockFormatDropdown';
import { FontFamilyDropdown } from './FontDropdown';
import FontSizeInput from './FontSizeInput';
import InsertDropdown from './InsertDropdown';
import TextFormatButtons from './TextFormatButtons';

// Custom overrides for friendly names and extra languages
const EXTRA_LANGUAGES: [string, string][] = [['php', 'PHP']];

const CODE_LANGUAGE_OPTIONS: [string, string][] = [];
for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
)) {
    CODE_LANGUAGE_OPTIONS.push([lang, friendlyName]);
}
// Add extra languages not in the default map
for (const entry of EXTRA_LANGUAGES) {
    if (!CODE_LANGUAGE_OPTIONS.some(([lang]) => lang === entry[0])) {
        CODE_LANGUAGE_OPTIONS.push(entry);
    }
}
CODE_LANGUAGE_OPTIONS.sort((a, b) => a[1].localeCompare(b[1]));

export default function ToolbarPlugin({
    setIsLinkEditMode,
}: {
    setIsLinkEditMode?: (v: boolean) => void;
}): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const { historyState: _historyState } = useSharedHistoryContext();
    const toolbarRef = useRef<HTMLDivElement>(null);

    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState<BlockType>('paragraph');
    const [selectedElementKey, setSelectedElementKey] =
        useState<NodeKey | null>(null);
    const [codeLanguage, setCodeLanguage] = useState<string>('');
    const [_isRTL, setIsRTL] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [fontColor, setFontColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState('15px');
    const [elementFormat, setElementFormat] =
        useState<ElementFormatType>('left');

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                          const parent = e.getParent();
                          return parent !== null && $isRootOrShadowRoot(parent);
                      });

            if (element === null)
                element = anchorNode.getTopLevelElementOrThrow();

            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));
            setIsCode(selection.hasFormat('code'));
            setIsRTL(selection.anchor.offset > 0 && false);

            const node = getSelectedNode(selection);
            const parent = node.getParent();
            setIsLink($isLinkNode(parent) || $isLinkNode(node));

            if (elementDOM !== null) {
                setSelectedElementKey(elementKey);
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(
                        anchorNode,
                        ListNode,
                    );
                    const type = parentList
                        ? parentList.getListType()
                        : element.getListType();
                    setBlockType(
                        type === 'bullet'
                            ? 'bullet'
                            : type === 'number'
                              ? 'number'
                              : 'check',
                    );
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    if (
                        type in
                        {
                            paragraph: 1,
                            quote: 1,
                            code: 1,
                            h1: 1,
                            h2: 1,
                            h3: 1,
                            h4: 1,
                            h5: 1,
                            h6: 1,
                        }
                    ) {
                        setBlockType(type as BlockType);
                    }
                    if ($isCodeNode(element))
                        setCodeLanguage(element.getLanguage() ?? '');
                }
            }

            setFontColor(
                $getSelectionStyleValueForProperty(
                    selection,
                    'color',
                    '#000000',
                ),
            );
            setBgColor(
                $getSelectionStyleValueForProperty(
                    selection,
                    'background-color',
                    '#ffffff',
                ),
            );
            setFontFamily(
                $getSelectionStyleValueForProperty(
                    selection,
                    'font-family',
                    'Arial',
                ),
            );
            setFontSize(
                $getSelectionStyleValueForProperty(
                    selection,
                    'font-size',
                    '15px',
                ),
            );
            setElementFormat(
                ($isElementNode(element) ? element.getFormatType() : 'left') ||
                    'left',
            );
        }
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerEditableListener((editable) =>
                setIsEditable(editable),
            ),
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => $updateToolbar());
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, _newEditor) => {
                    $updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
        );
    }, [editor, $updateToolbar]);

    const applyStyleText = useCallback(
        (styles: Record<string, string>, skipHistoryStack?: boolean) => {
            editor.update(
                () => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection))
                        $patchStyleText(selection, styles);
                },
                skipHistoryStack ? { tag: 'historic' } : {},
            );
        },
        [editor],
    );

    const onFontColorSelect = useCallback(
        (value: string, _skipHistoryStack?: boolean) => {
            applyStyleText({ color: value });
        },
        [applyStyleText],
    );

    const onBgColorSelect = useCallback(
        (value: string, _skipHistoryStack?: boolean) => {
            applyStyleText({ 'background-color': value });
        },
        [applyStyleText],
    );

    const insertLink = useCallback(() => {
        if (!isLink) {
            setIsLinkEditMode?.(true);
            editor.dispatchCommand(
                TOGGLE_LINK_COMMAND,
                sanitizeUrl('https://'),
            );
        } else {
            setIsLinkEditMode?.(false);
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink, setIsLinkEditMode]);

    const onCodeLanguageSelect = useCallback(
        (value: string) => {
            editor.update(() => {
                if (selectedElementKey !== null) {
                    const node = $getNodeByKey(selectedElementKey);
                    if ($isCodeNode(node)) node.setLanguage(value);
                }
            });
        },
        [editor, selectedElementKey],
    );

    return (
        <TooltipProvider>
            <div
                ref={toolbarRef}
                className="sticky top-0 z-10 flex min-h-12 flex-wrap items-center gap-0.5 border-b bg-card/80 p-1.5 backdrop-blur-sm"
            >
                {/* Undo / Redo */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            disabled={!canUndo || !isEditable}
                            onClick={() =>
                                editor.dispatchCommand(UNDO_COMMAND, undefined)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent disabled:opacity-50"
                        >
                            <Undo2 className="h-4 w-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Undo (Ctrl+Z)</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            disabled={!canRedo || !isEditable}
                            onClick={() =>
                                editor.dispatchCommand(REDO_COMMAND, undefined)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent disabled:opacity-50"
                        >
                            <Redo2 className="h-4 w-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Redo (Ctrl+Y)</p>
                    </TooltipContent>
                </Tooltip>

                <div className="toolbar-divider" />

                {/* Block Format */}
                <BlockFormatDropdown
                    blockType={blockType}
                    disabled={!isEditable}
                />

                {blockType === 'code' ? (
                    <>
                        <div className="toolbar-divider" />
                        <DropDown
                            disabled={!isEditable}
                            label={
                                <span className="min-w-[120px] text-sm">
                                    {CODE_LANGUAGE_FRIENDLY_NAME_MAP[
                                        normalizeCodeLang(codeLanguage)
                                    ] ||
                                        Object.fromEntries(EXTRA_LANGUAGES)[
                                            normalizeCodeLang(codeLanguage)
                                        ] ||
                                        codeLanguage ||
                                        'Plain text'}
                                </span>
                            }
                            buttonAriaLabel="Select language"
                        >
                            {CODE_LANGUAGE_OPTIONS.map(([lang, name]) => (
                                <DropDownItem
                                    key={lang}
                                    onClick={() => onCodeLanguageSelect(lang)}
                                    active={lang === codeLanguage}
                                >
                                    <span className="font-mono text-sm">
                                        {name}
                                    </span>
                                </DropDownItem>
                            ))}
                        </DropDown>
                    </>
                ) : (
                    <>
                        <div className="toolbar-divider" />

                        {/* Font Family */}
                        <FontFamilyDropdown
                            value={fontFamily}
                            disabled={!isEditable}
                            onChange={setFontFamily}
                        />

                        <div className="toolbar-divider" />

                        {/* Font Size */}
                        <FontSizeInput
                            value={fontSize}
                            disabled={!isEditable}
                            onChange={setFontSize}
                        />

                        <div className="toolbar-divider" />

                        {/* Text Formatting */}
                        <TextFormatButtons
                            isBold={isBold}
                            isItalic={isItalic}
                            isUnderline={isUnderline}
                            isStrikethrough={isStrikethrough}
                            isSubscript={isSubscript}
                            isSuperscript={isSuperscript}
                            isCode={isCode}
                            disabled={!isEditable}
                        />

                        <div className="toolbar-divider" />

                        {/* Colors */}
                        <DropdownColorPicker
                            disabled={!isEditable}
                            color={fontColor}
                            onChange={onFontColorSelect}
                            tooltip="Text color"
                        >
                            <Baseline className="h-4 w-4" />
                        </DropdownColorPicker>
                        <DropdownColorPicker
                            disabled={!isEditable}
                            color={bgColor}
                            onChange={onBgColorSelect}
                            tooltip="Highlight color"
                        >
                            <Highlighter className="h-4 w-4" />
                        </DropdownColorPicker>

                        <div className="toolbar-divider" />

                        {/* Link */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle
                                    size="sm"
                                    pressed={isLink}
                                    disabled={!isEditable}
                                    onPressedChange={insertLink}
                                    className="h-8 w-8 p-0"
                                >
                                    {isLink ? (
                                        <Unlink className="h-4 w-4" />
                                    ) : (
                                        <Link className="h-4 w-4" />
                                    )}
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isLink ? 'Remove Link' : 'Insert Link'}</p>
                            </TooltipContent>
                        </Tooltip>

                        <div className="toolbar-divider" />

                        {/* Alignment */}
                        <AlignDropdown
                            elementFormat={elementFormat}
                            disabled={!isEditable}
                        />

                        <div className="toolbar-divider" />

                        {/* Insert */}
                        <InsertDropdown disabled={!isEditable} />
                    </>
                )}
            </div>
        </TooltipProvider>
    );
}
