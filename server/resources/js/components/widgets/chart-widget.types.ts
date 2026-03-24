export interface DataPoint {
    date: string;
    value: number;
    label?: string;
}
export interface ChartWidgetProps {
    title: string;
    data: DataPoint[];
    chartType?: 'line' | 'donut';
    color?: string;
}
export type Granularity = 'daily' | 'weekly' | 'monthly';
