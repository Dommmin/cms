import type { LucideIcon } from 'lucide-react';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export type PreviewDeviceOption = {
    value: PreviewDevice;
    label: string;
    icon: LucideIcon;
    className: string;
};

export type ResponsivePreviewPanelProps = {
    previewUrl?: string | null;
    isRefreshing?: boolean;
    isStale?: boolean;
    updatedAt?: Date | null;
    onRefresh: () => void;
    onOpenPreview: () => void;
};
