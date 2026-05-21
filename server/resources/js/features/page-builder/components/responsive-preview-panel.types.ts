import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export type PreviewDeviceOption = {
    value: PreviewDevice;
    label: string;
    icon: LucideIcon;
    className: string;
};

export type ResponsivePreviewPanelProps = {
    inspector?: ReactNode;
    health?: ReactNode;
    previewUrl?: string | null;
    isRefreshing?: boolean;
    isStale?: boolean;
    updatedAt?: Date | null;
    onRefresh: () => void;
    onOpenPreview: () => void;
};
