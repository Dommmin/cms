import type { AvailableSection, BlockTypeConfig, Section } from '../types';

export type PageNavigatorProps = {
    className?: string;
    sections: Section[];
    availableSections: Record<string, AvailableSection>;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    activeSectionId: string | null;
    activeBlockId: string | null;
    onSelectSection: (sectionIndex: number) => void;
    onSelectBlock: (sectionIndex: number, blockIndex: number) => void;
    onToggleSectionVisibility: (sectionIndex: number) => void;
    onToggleBlockVisibility: (sectionIndex: number, blockIndex: number) => void;
    onDuplicateSection: (sectionIndex: number) => void;
    onDuplicateBlock: (sectionIndex: number, blockIndex: number) => void;
};
