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
    data: any;
    config?: any;
}
