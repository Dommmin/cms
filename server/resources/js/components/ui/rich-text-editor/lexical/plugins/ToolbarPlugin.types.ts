import type {
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
