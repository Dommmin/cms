import type { PaymentMethodConfig } from '@/api/checkout';

export type PaymentMethodValue =
    | 'blik'
    | 'apple_pay'
    | 'google_pay'
    | 'p24'
    | 'cash_on_delivery'
    | 'bank_transfer';
export interface PaymentStepProps {
    selected: PaymentMethodValue;
    onSelect: (method: PaymentMethodValue) => void;
    blikCode: string;
    onBlikCode: (code: string) => void;
    onApplePayToken: (token: string) => void;
    onGooglePayToken: (token: string) => void;
    cartTotal: number;
    currency: string;
    /** Provider config from GET /checkout/payment-methods — undefined = still loading */
    providerConfig?: PaymentMethodConfig[];
    /** True when the selected shipping method is personal pickup (carrier=pickup) */
    isPickup?: boolean;
}
