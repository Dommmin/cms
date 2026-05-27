export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export type WidgetType =
    | 'stat'
    | 'chart'
    | 'table'
    | 'recent_activity'
    | 'quick_actions';

export interface Widget {
    id: number;
    title: string;
    type: WidgetType;
    size: WidgetSize;
    icon?: string;
    color?: string;
    is_active: boolean;
    order: number;
    data: Record<string, unknown> | Array<Record<string, unknown>>;
    config?: Record<string, unknown>;
}
