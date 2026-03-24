import type {
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
    ElementFormatType,
} from 'lexical';

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'quote' | 'code' | 'bullet' | 'number' | 'check';
export type InsertDialog = 'image' | 'youtube' | 'table' | 'emoji' | 'special' | null;
export interface ToolbarState {
    canUndo: boolean;
    canRedo: boolean;
    blockType: BlockType;
    elementFormat: ElementFormatType;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    isCode: boolean;
    isSubscript: boolean;
    isSuperscript: boolean;
    isHighlight: boolean;
    isLink: boolean;
    codeLanguage: string;
    fontSize: string;
    fontFamily: string;
    fontColor: string;
}
