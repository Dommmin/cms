import type { FlashSale } from '@/types/api';

export interface FlashSalesResponse {
    data: Array<
        FlashSale & {
            product: { id: number; name: string; slug: string } | null;
            variant: { id: number; sku: string } | null;
        }
    >;
}
