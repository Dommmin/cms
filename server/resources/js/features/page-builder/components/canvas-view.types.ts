import type { AvailableSection, Section } from '../types';
import type { InlineEditableField } from './canvas-block-preview.types';

export type CanvasViewProps = {
    sections: Section[];
    activeSectionId: string | null;
    activeBlockId: string | null;
    onSelectSection: (sectionIndex: number) => void;
    onSelectBlock: (sectionIndex: number, blockIndex: number) => void;
    onEditBlock: (sectionIndex: number, blockIndex: number) => void;
    onInlineEdit: (
        sectionIndex: number,
        blockIndex: number,
        field: InlineEditableField,
        value: string,
    ) => void;
    availableSections: Record<string, AvailableSection>;
};
