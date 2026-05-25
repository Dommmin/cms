/**
 * Builder Toolbar Component
 * Action buttons for page builder
 * Follows Interface Segregation Principle - minimal props
 */

import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookmarkPlus,
    Eye,
    LayoutDashboard,
    LayoutTemplate,
    List,
    Plus,
    Save,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { ApprovalGroup } from './builder-toolbar/approval-group';
import { HistoryGroup } from './builder-toolbar/history-group';
import { ImportExportGroup } from './builder-toolbar/import-export-group';
import { SaveAsTemplateDialog } from './builder-toolbar/save-as-template-dialog';
import { SaveStatus } from './builder-toolbar/save-status';
import { SchedulePopover } from './builder-toolbar/schedule-popover';
import type { BuilderToolbarProps } from './builder-toolbar.types';

export function BuilderToolbar({
    pageId,
    pageTitle,
    isPublished: _isPublished,
    isSaving,
    isManualSaving,
    isAutoSaving,
    canUndo,
    canRedo,
    hasUnsavedChanges,
    lastSavedAt,
    scheduledPublishAt,
    scheduledUnpublishAt,
    approvalStatus,
    onAddSection,
    onOpenTemplates,
    onSave,
    onPreview,
    onUndo,
    onRedo,
    onScheduleSave,
    onSaveTemplate,
    onSubmitForReview,
    onApprove,
    onReject,
    viewMode = 'cards',
    onViewModeChange,
    editorMode = 'advanced',
    onEditorModeChange,
}: BuilderToolbarProps) {
    const __ = useTranslation();
    const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);

    return (
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={PageController.index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {__('builder.back', 'Back')}
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">{pageTitle}</h1>
                        <p className="text-sm text-muted-foreground">
                            {__('builder.page_builder', 'Page Builder')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <HistoryGroup
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={onUndo}
                        onRedo={onRedo}
                    />

                    <div className="px-2">
                        <SaveStatus
                            isSaving={isSaving || isAutoSaving}
                            hasUnsavedChanges={hasUnsavedChanges}
                            lastSavedAt={lastSavedAt}
                        />
                    </div>

                    <div className="h-4 w-px bg-border" />

                    <Button
                        onClick={onOpenTemplates}
                        variant="outline"
                        size="sm"
                    >
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        {__('builder.templates', 'Templates')}
                    </Button>

                    <Button onClick={onAddSection} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {__('builder.add_section', 'Add Section')}
                    </Button>

                    <div className="flex rounded-md border">
                        <Button
                            onClick={() => onViewModeChange?.('cards')}
                            variant={viewMode === 'cards' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-r-none"
                            title={__('builder.cards_view', 'Card view')}
                        >
                            <List className="mr-1 h-4 w-4" />
                            {__('builder.cards', 'Cards')}
                        </Button>
                        <Button
                            onClick={() => onViewModeChange?.('canvas')}
                            variant={
                                viewMode === 'canvas' ? 'default' : 'ghost'
                            }
                            size="sm"
                            className="rounded-l-none"
                            title={__('builder.canvas_view', 'Canvas view')}
                        >
                            <LayoutDashboard className="mr-1 h-4 w-4" />
                            {__('builder.canvas', 'Canvas')}
                        </Button>
                    </div>

                    <div className="flex rounded-md border">
                        <Button
                            onClick={() => onEditorModeChange?.('simple')}
                            variant={
                                editorMode === 'simple' ? 'default' : 'ghost'
                            }
                            size="sm"
                            className="rounded-r-none"
                            title={__('builder.simple_mode', 'Simple editor mode')}
                        >
                            <Sparkles className="mr-1 h-4 w-4" />
                            {__('builder.simple', 'Simple')}
                        </Button>
                        <Button
                            onClick={() => onEditorModeChange?.('advanced')}
                            variant={
                                editorMode === 'advanced' ? 'default' : 'ghost'
                            }
                            size="sm"
                            className="rounded-l-none"
                            title={__('builder.advanced_mode', 'Advanced editor mode')}
                        >
                            <SlidersHorizontal className="mr-1 h-4 w-4" />
                            {__('builder.advanced', 'Advanced')}
                        </Button>
                    </div>

                    <Button onClick={onPreview} variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        {__('builder.preview', 'Preview')}
                    </Button>

                    <SchedulePopover
                        scheduledPublishAt={scheduledPublishAt}
                        scheduledUnpublishAt={scheduledUnpublishAt}
                        onSave={onScheduleSave}
                    />

                    <Button
                        onClick={() => setSaveTemplateOpen(true)}
                        variant="outline"
                        size="sm"
                        title={__(
                            'builder.save_as_template_hint',
                            'Save current layout as a reusable template',
                        )}
                    >
                        <BookmarkPlus className="mr-2 h-4 w-4" />
                        {__('builder.save_as_template', 'Save as Template')}
                    </Button>

                    <ImportExportGroup pageId={pageId} />

                    <ApprovalGroup
                        approvalStatus={approvalStatus}
                        onSubmitForReview={onSubmitForReview}
                        onApprove={onApprove}
                        onReject={onReject}
                    />

                    <Button
                        onClick={onSave}
                        disabled={isManualSaving}
                        size="sm"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {isManualSaving
                            ? __('builder.saving', 'Saving...')
                            : __('builder.save', 'Save')}
                    </Button>
                </div>
            </div>

            <SaveAsTemplateDialog
                open={saveTemplateOpen}
                onClose={() => setSaveTemplateOpen(false)}
                onSave={onSaveTemplate}
            />
        </div>
    );
}
