import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BlockCard } from '../block-card';
import { BlockForm } from '../block-form';
import type { SortableBlocksProps } from '../blocks-list.types';

export function SortableBlocks({
    blocks,
    sectionIndex,
    expandedBlocks,
    activeBlockId = null,
    availableBlockTypes,
    onMoveBlock,
    onToggleBlock,
    onDeleteBlock,
    onCopyBlock,
    onSaveAsGlobal,
    onUpdateBlock,
    onUnlinkGlobal,
    onSelectBlock,
}: SortableBlocksProps) {
    const blockIds = blocks.map(
        (block) => block.client_id ?? `block-${block.id}`,
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = blocks.findIndex(
            (block) => block.client_id === active.id,
        );
        const newIndex = blocks.findIndex(
            (block) => block.client_id === over.id,
        );

        if (oldIndex === -1 || newIndex === -1) return;

        onMoveBlock(oldIndex, newIndex);
    };

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2">
                    {blocks.map((block, blockIndex) => {
                        const isExpanded = expandedBlocks.has(
                            block.client_id ?? '',
                        );
                        const blockTypeName =
                            availableBlockTypes[block.type]?.name;

                        return (
                            <BlockCard
                                key={block.client_id}
                                block={block}
                                blockIndex={blockIndex}
                                sectionIndex={sectionIndex}
                                isExpanded={isExpanded}
                                isSelected={activeBlockId === block.client_id}
                                blockTypeName={blockTypeName}
                                onToggle={() => onToggleBlock(blockIndex)}
                                onDelete={() => onDeleteBlock(blockIndex)}
                                onSelect={() => onSelectBlock?.(blockIndex)}
                                onCopy={() => onCopyBlock(blockIndex)}
                                onSaveAsGlobal={(name, desc) =>
                                    onSaveAsGlobal(blockIndex, name, desc)
                                }
                            >
                                <BlockForm
                                    block={block}
                                    availableBlockTypes={availableBlockTypes}
                                    onUpdate={(patch) =>
                                        onUpdateBlock(blockIndex, patch)
                                    }
                                    onUnlinkReusable={() =>
                                        onUnlinkGlobal(blockIndex)
                                    }
                                />
                            </BlockCard>
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
}
