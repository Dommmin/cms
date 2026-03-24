import type { Block, BlockTypeConfig, ReusableBlock } from '../types';

export type BlocksListProps = {
    blocks: Block[];
    sectionIndex: number;
    expandedBlocks: Set<string>;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    onAddBlock: (type: string) => void;
    onAddReusableBlock: (block: ReusableBlock) => void;
    onPasteBlock: (patch: Partial<Block>) => void;
    onUpdateBlock: (blockIndex: number, patch: Partial<Block>) => void;
    onDeleteBlock: (blockIndex: number) => void;
    onMoveBlock: (oldIndex: number, newIndex: number) => void;
    onToggleBlock: (blockIndex: number) => void;
};
