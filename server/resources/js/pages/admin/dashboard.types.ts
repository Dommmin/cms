import type { Widget, WidgetSize } from '@/types/widgets';

export interface WidgetShell {
    id: number;
    title: string;
    type: string;
    size: WidgetSize;
    icon: string | null;
    color: string | null;
    is_active: boolean;
    order: number;
    config: Record<string, unknown> | null;
}

export interface OnboardingStep {
    key: string;
    done: boolean;
    url: string;
}

export interface DashboardProps {
    widgetShells: WidgetShell[];
    onboarding: OnboardingStep[];
    widgets: Widget[] | undefined; // deferred — undefined until loaded
}
