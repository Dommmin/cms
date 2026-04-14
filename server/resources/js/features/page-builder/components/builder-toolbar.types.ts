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
    onAddSection: () => void;
    onOpenTemplates: () => void;
    onSave: () => void;
    onPreview: () => void;
    onToggleSplitView: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onChangeDevice: (device: PreviewDevice) => void;
};
