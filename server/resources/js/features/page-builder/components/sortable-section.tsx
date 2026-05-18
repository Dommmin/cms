/**
 * Sortable Section Component
 * Orchestrates section display with its blocks
 * Follows Open/Closed Principle - composed of smaller components
 */

import { BlocksList } from './blocks-list';
import { SectionCard } from './section-card';
import { SectionForm } from './section-form';
import type { SortableSectionProps } from './sortable-section.types';

export function SortableSection({
    section,
    index,
    pageId,
    isExpanded,
    isSelected = false,
    activeBlockId = null,
    expandedBlocks,
    availableSections,
    availableBlockTypes,
    onToggle,
    onDelete,
    onSelect,
    onUpdate,
    onAddBlock,
    onAddReusableBlock,
    onPasteBlock,
    onUpdateBlock,
    onDeleteBlock,
    onMoveBlock,
    onToggleBlock,
    onSelectBlock,
}: SortableSectionProps) {
    return (
        <SectionCard
            section={section}
            index={index}
            isExpanded={isExpanded}
            isSelected={isSelected}
            availableSections={availableSections}
            onToggle={onToggle}
            onDelete={onDelete}
            onSelect={onSelect}
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
                    pageId={pageId}
                    expandedBlocks={expandedBlocks}
                    activeBlockId={activeBlockId}
                    availableBlockTypes={availableBlockTypes}
                    onAddBlock={onAddBlock}
                    onAddReusableBlock={onAddReusableBlock}
                    onPasteBlock={onPasteBlock}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteBlock={onDeleteBlock}
                    onMoveBlock={onMoveBlock}
                    onToggleBlock={onToggleBlock}
                    onSelectBlock={onSelectBlock}
                />
            </div>
        </SectionCard>
    );
}
