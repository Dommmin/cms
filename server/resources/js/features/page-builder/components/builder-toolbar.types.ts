import type { Section } from '../types';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

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
    timeSince?: string | null;
    scheduledPublishAt: string | null;
    scheduledUnpublishAt: string | null;
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
};
