import type { Block } from '../types';

export type BlockCardProps = {
    block: Block;
    blockIndex: number;
    sectionIndex: number;
    isExpanded: boolean;
    blockTypeName?: string;
    onToggle: () => void;
    onDelete: () => void;
    onCopy?: () => void;
    onSaveAsGlobal?: (name: string, description: string) => void;
    children?: React.ReactNode;
};
