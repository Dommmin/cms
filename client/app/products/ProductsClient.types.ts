export type ViewMode = 'grid' | 'list';

export interface PendingFilters {
    brand: string;
    min_price: string;
    max_price: string;
    in_stock: boolean;
    attributes: Record<string, string[]>;
}
