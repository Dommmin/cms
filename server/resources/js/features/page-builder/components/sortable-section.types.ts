import type {
    AvailableSection,
    Block,
    BlockTypeConfig,
    ReusableBlock,
    Section,
} from '../types';

export type SortableSectionProps = {
    section: Section;
    index: number;
    isExpanded: boolean;
    expandedBlocks: Set<string>;
    availableSections: Record<string, AvailableSection>;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    onToggle: () => void;
    onDelete: () => void;
    onUpdate: (patch: Partial<Section>) => void;
    onAddBlock: (type: string) => void;
    onAddReusableBlock: (block: ReusableBlock) => void;
    onPasteBlock: (patch: Partial<Block>) => void;
    onUpdateBlock: (blockIndex: number, patch: Partial<Block>) => void;
    onDeleteBlock: (blockIndex: number) => void;
    onMoveBlock: (oldIndex: number, newIndex: number) => void;
    onToggleBlock: (blockIndex: number) => void;
};
