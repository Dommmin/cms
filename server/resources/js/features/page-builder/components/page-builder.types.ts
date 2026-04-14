import type { BuilderData, Section } from '../types';
import type { PreviewDevice } from './builder-toolbar.types';

export type PageBuilderProps = {
    data: BuilderData;
    onSave: (sections: BuilderData['sections']) => Promise<void>;
    onPreview: () => void;
    onChange?: (sections: Section[]) => void;
    isSplitView?: boolean;
    isSaving?: boolean;
    previewDevice?: PreviewDevice;
    onToggleSplitView?: () => void;
    onChangeDevice?: (device: PreviewDevice) => void;
    hasUnsavedChanges?: boolean;
    lastSavedAt?: Date | null;
    scheduledPublishAt?: string | null;
    scheduledUnpublishAt?: string | null;
    onScheduleSave?: (publishAt: string | null, unpublishAt: string | null) => void;
    onSaveTemplate?: (name: string, description: string, category: string, isGlobal: boolean) => void;
};
