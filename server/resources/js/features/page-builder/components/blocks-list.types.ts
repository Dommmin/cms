import type {
    Block,
    BlockTypeConfig,
    EditorMode,
    ReusableBlock,
} from '../types';

export type BlocksListProps = {
    blocks: Block[];
    sectionIndex: number;
    pageId: number;
    expandedBlocks: Set<string>;
    activeBlockId?: string | null;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    editorMode: EditorMode;
    onAddBlock: (type: string) => void;
    onAddReusableBlock: (block: ReusableBlock) => void;
    onPasteBlock: (patch: Partial<Block>) => void;
    onUpdateBlock: (blockIndex: number, patch: Partial<Block>) => void;
    onDeleteBlock: (blockIndex: number) => void;
    onMoveBlock: (oldIndex: number, newIndex: number) => void;
    onToggleBlock: (blockIndex: number) => void;
    onSelectBlock?: (blockIndex: number) => void;
};

export type LibraryModalProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (block: ReusableBlock) => void;
};

export type BlocksListHeaderProps = {
    hasClipboard: boolean;
    onPasteBlock: () => void;
    onOpenLibrary: () => void;
    onOpenPicker: () => void;
};

export type SortableBlocksProps = {
    blocks: Block[];
    sectionIndex: number;
    expandedBlocks: Set<string>;
    activeBlockId?: string | null;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    editorMode: EditorMode;
    onMoveBlock: (oldIndex: number, newIndex: number) => void;
    onToggleBlock: (blockIndex: number) => void;
    onDeleteBlock: (blockIndex: number) => void;
    onCopyBlock: (blockIndex: number) => void;
    onSaveAsGlobal: (
        blockIndex: number,
        name: string,
        description: string,
    ) => void;
    onUpdateBlock: (blockIndex: number, patch: Partial<Block>) => void;
    onUnlinkGlobal: (blockIndex: number) => void;
    onSelectBlock?: (blockIndex: number) => void;
};
