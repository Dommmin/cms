export interface InventorySummary {
    total_variants: number;
    out_of_stock: number;
    low_stock: number;
    in_stock: number;
    total_stock_value: number;
}

export interface InventoryItem {
    id: number;
    sku: string;
    name: string;
    stock_quantity: number;
    stock_threshold: number;
    price: number;
    stock_value?: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface InventoryData {
    summary: InventorySummary;
    top_by_value: InventoryItem[];
    out_of_stock_items: InventoryItem[];
}

export interface InventoryProps {
    data: InventoryData;
}
