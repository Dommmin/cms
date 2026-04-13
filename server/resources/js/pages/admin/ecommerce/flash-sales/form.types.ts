export interface ProductOption {
    id: number;
    name: string;
}

export interface FlashSaleFormData {
    id?: number;
    product_id: number;
    variant_id: number | null;
    name: string;
    sale_price: number;
    starts_at: string;
    ends_at: string;
    stock_limit: number | null;
    is_active: boolean;
}

export interface FormPageProps {
    products: ProductOption[];
    flashSale?: FlashSaleFormData;
}
