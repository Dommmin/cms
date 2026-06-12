import type { BreadcrumbItem } from '@/types';

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    children?: React.ReactNode;
    className?: string;
}
export interface PageHeaderActionsProps {
    children: React.ReactNode;
    className?: string;
    compact?: boolean;
    stackOnMobile?: boolean;
}

export interface PageHeaderOverflowMenuProps {
    children: React.ReactNode;
    className?: string;
    label?: string;
}
