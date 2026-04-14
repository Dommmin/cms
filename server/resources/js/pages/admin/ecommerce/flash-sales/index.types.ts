export type FlashSaleStatus =
    | 'active'
    | 'scheduled'
    | 'ended'
    | 'exhausted'
    | 'inactive';

export interface FlashSaleListItem {
    id: number;
    name: string;
    sale_price: number;
    starts_at: string;
    ends_at: string;
    stock_limit: number | null;
    stock_sold: number;
    is_active: boolean;
    status: FlashSaleStatus;
    product: { id: number; name: string } | null;
    variant: { id: number; sku: string } | null;
}

export interface PaginationData {
    data: FlashSaleListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface IndexProps {
    flashSales: PaginationData;
    filters: { search?: string };
}
