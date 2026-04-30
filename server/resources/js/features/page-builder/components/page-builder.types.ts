import type { BuilderData, Section } from '../types';
import type { ApprovalStatus } from './builder-toolbar.types';

export type PageBuilderProps = {
    data: BuilderData;
    onSave: (sections: BuilderData['sections']) => Promise<void>;
    onPreview: () => void;
    onChange?: (sections: Section[]) => void;
    isSaving?: boolean;
    hasUnsavedChanges?: boolean;
    lastSavedAt?: Date | null;
    scheduledPublishAt?: string | null;
    scheduledUnpublishAt?: string | null;
    approvalStatus?: ApprovalStatus;
    onScheduleSave?: (
        publishAt: string | null,
        unpublishAt: string | null,
    ) => void;
    onSaveTemplate?: (
        name: string,
        description: string,
        category: string,
        isGlobal: boolean,
    ) => void;
    onSubmitForReview?: () => void;
    onApprove?: () => void;
    onReject?: (note: string) => void;
};
