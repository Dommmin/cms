import type { ReturnRequestPayload } from '@/api/orders';
import type { OrderItem, Page } from '@/types/api';

export type ReturnRequestType = ReturnRequestPayload['type'];

export interface LookupFormState {
    reference_number: string;
    email: string;
}

export interface SelectedItemState {
    [itemId: number]: number;
}

export interface OrderItemRowProps {
    item: OrderItem;
    selectedQuantity: number | undefined;
    maxQuantity: number;
    disabled: boolean;
    onToggle: (itemId: number, checked: boolean) => void;
    onQuantityChange: (itemId: number, quantity: number) => void;
}

export interface ReturnsPortalModuleProps {
    page: Page;
}
