import type { EditorMode, Section } from '../types';

export type ApprovalStatus = 'draft' | 'in_review' | 'approved';

export type BuilderToolbarProps = {
    pageId: number;
    pageTitle: string;
    isPublished: boolean;
    isSaving: boolean;
    isManualSaving: boolean;
    isAutoSaving: boolean;
    canUndo: boolean;
    canRedo: boolean;
    hasUnsavedChanges: boolean;
    lastSavedAt: Date | null;
    scheduledPublishAt: string | null;
    scheduledUnpublishAt: string | null;
    approvalStatus: ApprovalStatus;
    sections: Section[];
    onAddSection: () => void;
    onOpenTemplates: () => void;
    onSave: () => void;
    onPreview: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onScheduleSave: (
        scheduledPublishAt: string | null,
        scheduledUnpublishAt: string | null,
    ) => void;
    onSaveTemplate: (
        name: string,
        description: string,
        category: string,
        isGlobal: boolean,
    ) => void;
    onSubmitForReview: () => void;
    onApprove: () => void;
    onReject: (note: string) => void;
    viewMode?: 'cards' | 'canvas';
    onViewModeChange?: (mode: 'cards' | 'canvas') => void;
    editorMode?: EditorMode;
    onEditorModeChange?: (mode: EditorMode) => void;
};

export type SaveStatusProps = {
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    lastSavedAt: Date | null;
};

export type HistoryGroupProps = {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
};

export type SchedulePopoverProps = {
    scheduledPublishAt: string | null;
    scheduledUnpublishAt: string | null;
    onSave: (
        scheduledPublishAt: string | null,
        scheduledUnpublishAt: string | null,
    ) => void;
};

export type SaveAsTemplateDialogProps = {
    open: boolean;
    onClose: () => void;
    onSave: (
        name: string,
        description: string,
        category: string,
        isGlobal: boolean,
    ) => void;
};

export type ImportExportGroupProps = {
    pageId: number;
};

export type ApprovalGroupProps = {
    approvalStatus: ApprovalStatus;
    onSubmitForReview: () => void;
    onApprove: () => void;
    onReject: (note: string) => void;
};
