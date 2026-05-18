import type { Block } from '../types';

export type BlockCardProps = {
    block: Block;
    blockIndex: number;
    sectionIndex: number;
    isExpanded: boolean;
    isSelected?: boolean;
    blockTypeName?: string;
    onToggle: () => void;
    onDelete: () => void;
    onSelect?: () => void;
    onCopy?: () => void;
    onSaveAsGlobal?: (name: string, description: string) => void;
    children?: React.ReactNode;
};
