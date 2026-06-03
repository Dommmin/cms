export type ViewMode = 'grid' | 'list';

export interface PendingFilters {
    brand: string;
    min_price: string;
    max_price: string;
    in_stock: boolean;
    attributes: Record<string, string[]>;
}

export interface ActiveFilterChip {
    key: string;
    label: string;
    onRemove: () => void;
}

export interface ProductsClientProps {
    basePath?: string;
    initialCategory?: string;
    initialBrand?: string;
    title?: string | null;
    excerpt?: string | null;
}
