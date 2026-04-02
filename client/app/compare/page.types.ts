import type { Product } from '@/types/api';

export interface CompareRow {
    label: string;
    group?: string;
    render: (p: Product) => React.ReactNode;
    rawValue?: (p: Product) => string;
}
