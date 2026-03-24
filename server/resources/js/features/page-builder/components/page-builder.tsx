/**
 * Page Builder Component
 * Main orchestrator for page building functionality
 * Follows SOLID principles - composed of specialized components
 */

import type { DragEndEvent } from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useBuilderState } from '../hooks/use-builder-state';
import type { BuilderData, Section } from '../types';
import { BuilderToolbar } from './builder-toolbar';
import type { PreviewDevice } from './builder-toolbar.types';
import type { SectionTemplate } from './section-templates-dialog.types';
import { SectionTemplatesDialog } from './section-templates-dialog';
import { SortableSection } from './sortable-section';
import type { PageBuilderProps } from './page-builder.types';

export function PageBuilder({
    data,
    onSave,
    onPreview,
    onChange,
    isSplitView = false,
    isSaving = false,
    previewDevice = 'desktop',
    onToggleSplitView,
    onChangeDevice,
}: PageBuilderProps) {
    const {
        sections,
        expandedSections,
        expandedBlocks,
        undo,
        redo,
        canUndo,
        canRedo,
        addSection,
        updateSection,
        deleteSection,
        moveSection,
        insertTemplateSections,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
        toggleSection,
        toggleBlock,
    } = useBuilderState(data.sections);

    const [templatesOpen, setTemplatesOpen] = useState(false);

    useEffect(() => {
        onChange?.(sections);
    }, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

    // Keyboard shortcuts: Ctrl+Z = undo, Ctrl+Shift+Z or Ctrl+Y = redo
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            )
                return;
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    undo();
                } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleSectionDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = Number(String(active.id).split('-')[1]);
        const newIndex = Number(String(over.id).split('-')[1]);

        moveSection(oldIndex, newIndex);
    };

    const handleSave = async () => {
        await onSave(sections);
    };

    const handleInsertTemplate = (template: SectionTemplate) => {
        insertTemplateSections(template.sections);
    };

    const firstSectionType = Object.keys(data.available_sections)[0] ?? '';

    const sectionIds = sections.map((_, index) => `section-${index}`);

    return (
        <div className="min-h-screen bg-muted/30">
            <BuilderToolbar
                pageId={data.page.id}
                pageTitle={data.page.title}
                isPublished={data.page.is_published}
                isSaving={isSaving}
                isSplitView={isSplitView}
                canUndo={canUndo}
                canRedo={canRedo}
                previewDevice={previewDevice}
                onAddSection={() => addSection(firstSectionType)}
                onOpenTemplates={() => setTemplatesOpen(true)}
                onSave={handleSave}
                onPreview={onPreview}
                onToggleSplitView={onToggleSplitView ?? (() => {})}
                onUndo={undo}
                onRedo={redo}
                onChangeDevice={onChangeDevice ?? (() => {})}
            />

            <div
                className={
                    isSplitView ? 'px-4 py-8' : 'container max-w-5xl py-8'
                }
            >
                {sections.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-background p-16 text-center">
                        <h3 className="mb-2 text-lg font-semibold">
                            No sections yet
                        </h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Get started by adding a section or choose a template
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => addSection(firstSectionType)}
                                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Add Section
                            </button>
                            <button
                                onClick={() => setTemplatesOpen(true)}
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                            >
                                From Template
                            </button>
                        </div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleSectionDragEnd}
                    >
                        <SortableContext
                            items={sectionIds}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {sections.map((section, index) => (
                                    <SortableSection
                                        key={index}
                                        section={section}
                                        index={index}
                                        isExpanded={expandedSections.has(index)}
                                        expandedBlocks={expandedBlocks}
                                        availableSections={
                                            data.available_sections
                                        }
                                        availableBlockTypes={
                                            data.available_block_relations
                                        }
                                        onToggle={() => toggleSection(index)}
                                        onDelete={() => deleteSection(index)}
                                        onUpdate={(patch) =>
                                            updateSection(index, patch)
                                        }
                                        onAddBlock={(type) =>
                                            addBlock(index, { type })
                                        }
                                        onAddReusableBlock={(block) =>
                                            addBlock(index, {
                                                type: block.type,
                                                configuration:
                                                    block.configuration,
                                                relations:
                                                    block.relations_config ??
                                                    [],
                                                reusable_block_id: block.id,
                                                reusable_block_name: block.name,
                                            })
                                        }
                                        onPasteBlock={(patch) =>
                                            addBlock(index, patch)
                                        }
                                        onUpdateBlock={(blockIndex, patch) =>
                                            updateBlock(
                                                index,
                                                blockIndex,
                                                patch,
                                            )
                                        }
                                        onDeleteBlock={(blockIndex) =>
                                            deleteBlock(index, blockIndex)
                                        }
                                        onMoveBlock={(oldIdx, newIdx) =>
                                            moveBlock(index, oldIdx, newIdx)
                                        }
                                        onToggleBlock={(blockIndex) =>
                                            toggleBlock(index, blockIndex)
                                        }
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <SectionTemplatesDialog
                open={templatesOpen}
                onClose={() => setTemplatesOpen(false)}
                onInsert={handleInsertTemplate}
            />
        </div>
    );
}
