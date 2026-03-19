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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config?: any;
}
