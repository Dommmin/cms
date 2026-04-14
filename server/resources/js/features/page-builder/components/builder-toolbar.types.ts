import type { Section } from '../types';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export type ApprovalStatus = 'draft' | 'in_review' | 'approved';

export type BuilderToolbarProps = {
    pageId: number;
    pageTitle: string;
    isPublished: boolean;
    isSaving: boolean;
    isSplitView: boolean;
    canUndo: boolean;
    canRedo: boolean;
    previewDevice: PreviewDevice;
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
    onToggleSplitView: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onChangeDevice: (device: PreviewDevice) => void;
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
};
