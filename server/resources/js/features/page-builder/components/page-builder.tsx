/**
 * Page Builder Component
 * Main orchestrator for page building functionality
 * Follows SOLID principles - composed of specialized components
 */

import type { DragEndEvent } from '@dnd-kit/core';
import {
    closestCenter,
    DndContext,
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
import { useTranslation } from '@/hooks/use-translation';
import { useBuilderState } from '../hooks/use-builder-state';
import { BuilderToolbar } from './builder-toolbar';
import type { PageBuilderProps } from './page-builder.types';
import { PageInspector } from './page-inspector';
import { PageNavigator } from './page-navigator';
import { ResponsivePreviewPanel } from './responsive-preview-panel';
import { SectionTemplatesDialog } from './section-templates-dialog';
import type { SectionTemplate } from './section-templates-dialog.types';
import { SortableSection } from './sortable-section';

export function PageBuilder({
    data,
    onSave,
    onPreview,
    onChange,
    previewUrl = null,
    isPreviewRefreshing = false,
    isPreviewStale = false,
    previewUpdatedAt = null,
    onRefreshPreview,
    isSaving = false,
    isManualSaving = isSaving,
    isAutoSaving = false,
    hasUnsavedChanges = false,
    lastSavedAt = null,
    scheduledPublishAt = null,
    scheduledUnpublishAt = null,
    approvalStatus = 'draft',
    onScheduleSave,
    onSaveTemplate,
    onSubmitForReview,
    onApprove,
    onReject,
}: PageBuilderProps) {
    const __ = useTranslation();
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
        duplicateSection,
        insertTemplateSections,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
        duplicateBlock,
        toggleSection,
        toggleBlock,
    } = useBuilderState(data.sections);

    const [templatesOpen, setTemplatesOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

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

        const oldIndex = sections.findIndex(
            (section) => section.client_id === active.id,
        );
        const newIndex = sections.findIndex(
            (section) => section.client_id === over.id,
        );

        if (oldIndex === -1 || newIndex === -1) return;

        moveSection(oldIndex, newIndex);
    };

    const handleSave = async () => {
        await onSave(sections);
    };

    const handleInsertTemplate = (template: SectionTemplate) => {
        insertTemplateSections(template.sections);
    };

    const scrollToBuilderItem = (kind: 'section' | 'block', id?: string) => {
        if (!id) return;

        window.setTimeout(() => {
            document
                .getElementById(`pb-${kind}-${id}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 0);
    };

    const handleSelectSection = (sectionIndex: number) => {
        const section = sections[sectionIndex];
        if (!section?.client_id) return;

        setActiveSectionId(section.client_id);
        setActiveBlockId(null);

        if (!expandedSections.has(section.client_id)) {
            toggleSection(section.client_id);
        }

        scrollToBuilderItem('section', section.client_id);
    };

    const handleSelectBlock = (sectionIndex: number, blockIndex: number) => {
        const section = sections[sectionIndex];
        const block = section?.blocks[blockIndex];
        if (!section?.client_id || !block?.client_id) return;

        setActiveSectionId(section.client_id);
        setActiveBlockId(block.client_id);

        if (!expandedSections.has(section.client_id)) {
            toggleSection(section.client_id);
        }
        if (!expandedBlocks.has(block.client_id)) {
            toggleBlock(block.client_id);
        }

        scrollToBuilderItem('block', block.client_id);
    };

    const handleToggleSectionVisibility = (sectionIndex: number) => {
        const section = sections[sectionIndex];
        if (!section) return;

        updateSection(sectionIndex, { is_active: !section.is_active });
    };

    const handleToggleBlockVisibility = (
        sectionIndex: number,
        blockIndex: number,
    ) => {
        const block = sections[sectionIndex]?.blocks[blockIndex];
        if (!block) return;

        updateBlock(sectionIndex, blockIndex, { is_active: !block.is_active });
    };

    const firstSectionType = Object.keys(data.available_sections)[0] ?? '';

    const sectionIds = sections.map(
        (section) => section.client_id ?? `section-${section.id}`,
    );
    const activeSectionIndex = activeSectionId
        ? sections.findIndex((section) => section.client_id === activeSectionId)
        : -1;
    const activeSection =
        activeSectionIndex >= 0 ? sections[activeSectionIndex] : null;
    const activeBlockIndex =
        activeSection && activeBlockId
            ? activeSection.blocks.findIndex(
                  (block) => block.client_id === activeBlockId,
              )
            : -1;
    const activeBlock =
        activeSection && activeBlockIndex >= 0
            ? activeSection.blocks[activeBlockIndex]
            : null;

    return (
        <div className="min-h-screen bg-muted/30">
            <BuilderToolbar
                pageId={data.page.id}
                pageTitle={data.page.title}
                isPublished={data.page.is_published}
                isSaving={isSaving}
                isManualSaving={isManualSaving}
                isAutoSaving={isAutoSaving}
                canUndo={canUndo}
                canRedo={canRedo}
                hasUnsavedChanges={hasUnsavedChanges}
                lastSavedAt={lastSavedAt}
                scheduledPublishAt={scheduledPublishAt}
                scheduledUnpublishAt={scheduledUnpublishAt}
                approvalStatus={approvalStatus}
                sections={sections}
                onAddSection={() => addSection(firstSectionType)}
                onOpenTemplates={() => setTemplatesOpen(true)}
                onSave={handleSave}
                onPreview={onPreview}
                onUndo={undo}
                onRedo={redo}
                onScheduleSave={onScheduleSave ?? (() => {})}
                onSaveTemplate={onSaveTemplate ?? (() => {})}
                onSubmitForReview={onSubmitForReview ?? (() => {})}
                onApprove={onApprove ?? (() => {})}
                onReject={onReject ?? (() => {})}
            />

            <div className="container grid max-w-[100rem] gap-6 py-8 lg:grid-cols-[18rem_minmax(0,1fr)_minmax(22rem,30rem)]">
                <PageNavigator
                    sections={sections}
                    availableSections={data.available_sections}
                    availableBlockTypes={data.available_block_relations}
                    activeSectionId={activeSectionId}
                    activeBlockId={activeBlockId}
                    onSelectSection={handleSelectSection}
                    onSelectBlock={handleSelectBlock}
                    onToggleSectionVisibility={handleToggleSectionVisibility}
                    onToggleBlockVisibility={handleToggleBlockVisibility}
                    onDuplicateSection={duplicateSection}
                    onDuplicateBlock={duplicateBlock}
                />

                <div className="min-w-0">
                    {sections.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-background p-16 text-center">
                            <h3 className="mb-2 text-lg font-semibold">
                                {__(
                                    'builder.no_sections_yet',
                                    'No sections yet',
                                )}
                            </h3>
                            <p className="mb-6 text-sm text-muted-foreground">
                                {__(
                                    'builder.no_sections_hint',
                                    'Get started by adding a section or choose a template',
                                )}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => addSection(firstSectionType)}
                                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    {__('builder.add_section', 'Add Section')}
                                </button>
                                <button
                                    onClick={() => setTemplatesOpen(true)}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    {__(
                                        'builder.from_template',
                                        'From Template',
                                    )}
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
                                            key={section.client_id}
                                            section={section}
                                            index={index}
                                            pageId={data.page.id}
                                            isExpanded={expandedSections.has(
                                                section.client_id ?? '',
                                            )}
                                            isSelected={
                                                activeSectionId ===
                                                    section.client_id &&
                                                !activeBlockId
                                            }
                                            activeBlockId={activeBlockId}
                                            expandedBlocks={expandedBlocks}
                                            availableSections={
                                                data.available_sections
                                            }
                                            availableBlockTypes={
                                                data.available_block_relations
                                            }
                                            onToggle={() =>
                                                toggleSection(
                                                    section.client_id ?? '',
                                                )
                                            }
                                            onDelete={() =>
                                                deleteSection(index)
                                            }
                                            onSelect={() =>
                                                handleSelectSection(index)
                                            }
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
                                                    reusable_block_name:
                                                        block.name,
                                                })
                                            }
                                            onPasteBlock={(patch) =>
                                                addBlock(index, patch)
                                            }
                                            onUpdateBlock={(
                                                blockIndex,
                                                patch,
                                            ) =>
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
                                                toggleBlock(
                                                    section.blocks[blockIndex]
                                                        ?.client_id ?? '',
                                                )
                                            }
                                            onSelectBlock={(blockIndex) =>
                                                handleSelectBlock(
                                                    index,
                                                    blockIndex,
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                <ResponsivePreviewPanel
                    inspector={
                        <PageInspector
                            section={activeSection}
                            sectionIndex={
                                activeSectionIndex >= 0
                                    ? activeSectionIndex
                                    : null
                            }
                            block={activeBlock}
                            blockIndex={
                                activeBlockIndex >= 0 ? activeBlockIndex : null
                            }
                            availableSections={data.available_sections}
                            availableBlockTypes={data.available_block_relations}
                            onUpdateSection={updateSection}
                            onUpdateBlock={updateBlock}
                        />
                    }
                    previewUrl={previewUrl}
                    isRefreshing={isPreviewRefreshing}
                    isStale={isPreviewStale}
                    updatedAt={previewUpdatedAt}
                    onRefresh={onRefreshPreview ?? onPreview}
                    onOpenPreview={onPreview}
                />
            </div>

            <SectionTemplatesDialog
                open={templatesOpen}
                onClose={() => setTemplatesOpen(false)}
                onInsert={handleInsertTemplate}
            />
        </div>
    );
}
