import type {
    ElementFormatType,
} from 'lexical';
import type { ReactNode } from 'react';

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'quote' | 'code' | 'bullet' | 'number' | 'check';
export type InsertDialog = 'image' | 'youtube' | 'table' | 'emoji' | 'special' | null;

export type ToolbarMode = 'simple' | 'full';

export type ToolbarPluginProps = {
    mode?: ToolbarMode;
};

export type ToolbarButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    tooltip: string;
    children: ReactNode;
    className?: string;
};

export type ToolbarToggleProps = {
    pressed: boolean;
    onPressedChange: () => void;
    tooltip: string;
    children: ReactNode;
    className?: string;
};

export type YouTubeDialogProps = {
    open: boolean;
    url: string;
    onOpenChange: (open: boolean) => void;
    onUrlChange: (url: string) => void;
    onInsert: () => void;
};

export type TableDialogProps = {
    open: boolean;
    rows: number;
    columns: number;
    onOpenChange: (open: boolean) => void;
    onRowsChange: (rows: number) => void;
    onColumnsChange: (columns: number) => void;
    onInsert: () => void;
};

export type CharacterDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (value: string) => void;
};

export type BlockTypeMenuProps = {
    blockType: BlockType;
    onSelect: (type: BlockType) => void;
};

export type InsertMenuProps = {
    onInsertHorizontalRule: () => void;
    onOpenMediaPicker: () => void;
    onOpenYouTubeDialog: () => void;
    onOpenTableDialog: () => void;
    onInsertColumns: (templateColumns: string) => void;
    onInsertCollapsible: () => void;
    onOpenEmojiDialog: () => void;
    onOpenSpecialCharactersDialog: () => void;
};

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
