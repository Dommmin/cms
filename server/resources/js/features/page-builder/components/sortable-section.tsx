/**
 * Sortable Section Component
 * Orchestrates section display with its blocks
 * Follows Open/Closed Principle - composed of smaller components
 */

import type {
    Section,
    Block,
    AvailableSection,
    BlockTypeConfig,
    ReusableBlock,
} from '../types';
import { BlocksList } from './blocks-list';
import { SectionCard } from './section-card';
import { SectionForm } from './section-form';
import type { SortableSectionProps } from './sortable-section.types';

export function SortableSection({
    section,
    index,
    isExpanded,
    expandedBlocks,
    availableSections,
    availableBlockTypes,
    onToggle,
    onDelete,
    onUpdate,
    onAddBlock,
    onAddReusableBlock,
    onPasteBlock,
    onUpdateBlock,
    onDeleteBlock,
    onMoveBlock,
    onToggleBlock,
}: SortableSectionProps) {
    return (
        <SectionCard
            section={section}
            index={index}
            isExpanded={isExpanded}
            availableSections={availableSections}
            onToggle={onToggle}
            onDelete={onDelete}
        >
            <div className="space-y-6">
                {/* Section Configuration Form */}
                <SectionForm
                    section={section}
                    availableSections={availableSections}
                    onUpdate={onUpdate}
                />

                {/* Blocks List */}
                <BlocksList
                    blocks={section.blocks}
                    sectionIndex={index}
                    expandedBlocks={expandedBlocks}
                    availableBlockTypes={availableBlockTypes}
                    onAddBlock={onAddBlock}
                    onAddReusableBlock={onAddReusableBlock}
                    onPasteBlock={onPasteBlock}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteBlock={onDeleteBlock}
                    onMoveBlock={onMoveBlock}
                    onToggleBlock={onToggleBlock}
                />
            </div>
        </SectionCard>
    );
}
