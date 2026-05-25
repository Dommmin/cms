import type {
    AvailableSection,
    Block,
    BlockTypeConfig,
    EditorMode,
    Section,
} from '../types';

export type PageInspectorProps = {
    section: Section | null;
    sectionIndex: number | null;
    block: Block | null;
    blockIndex: number | null;
    availableSections: Record<string, AvailableSection>;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    onUpdateSection: (sectionIndex: number, patch: Partial<Section>) => void;
    onUpdateBlock: (
        sectionIndex: number,
        blockIndex: number,
        patch: Partial<Block>,
    ) => void;
    editorMode: EditorMode;
    onClose?: () => void;
};
