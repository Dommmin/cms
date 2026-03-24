export interface StatCardProps {
    title: string;
    value: number | string;
    trend?: number;
    icon?: string;
    color?: string;
    format?: 'number' | 'currency';
}
