import type {
    AddressPayload,
    PaymentMethodConfig,
    ShippingMethod,
} from '@/api/checkout';
import type { PaymentMethodValue } from '@/components/checkout/payment-step.types';
import type { Address, Cart } from '@/types/api';

export type StepState = 'completed' | 'current' | 'upcoming';

export type CheckoutStep = {
    label: string;
    state: StepState;
};

export type CheckoutStepIndicatorProps = {
    label: string;
    number: number;
    state: StepState;
};

export type GuestEmailStepProps = {
    guestEmail: string;
    submitAttempted: boolean;
    onGuestEmailChange: (value: string) => void;
};

export type ShippingMethodStepProps = {
    billing: AddressPayload;
    isLoading: boolean;
    pickupPointId: string;
    selectedMethod: number | null;
    selectedShippingMethod: ShippingMethod | undefined;
    shippingMethods: ShippingMethod[];
    subtotal: number;
    onMethodChange: (id: number) => void;
    onPickupPointChange: (id: string) => void;
    formatPrice: (amount: number) => string;
};

export type OrderSummaryProps = {
    cart: Cart;
    effectiveShipping: number;
    error: Error | null;
    isPending: boolean;
    selectedMethod: number | null;
    submitAttempted: boolean;
    subtotal: number;
    termsAccepted: boolean;
    total: number;
    onTermsAcceptedChange: (accepted: boolean) => void;
    formatPrice: (amount: number) => string;
};

export type CheckoutAddressSectionProps = {
    billing: AddressPayload;
    sameAddress: boolean;
    savedAddresses: Address[];
    saveBilling: boolean;
    saveShipping: boolean;
    shipping: AddressPayload;
    submitAttempted: boolean;
    token: string | null;
    onBillingChange: (address: AddressPayload) => void;
    onSameAddressChange: (sameAddress: boolean) => void;
    onSaveBillingChange: (save: boolean) => void;
    onSaveShippingChange: (save: boolean) => void;
    onShippingChange: (address: AddressPayload) => void;
};

export type CheckoutPaymentSectionProps = {
    blikCode: string;
    currencyCode: string;
    isPickup: boolean;
    paymentMethod: PaymentMethodValue;
    paymentMethods: PaymentMethodConfig[] | undefined;
    total: number;
    onApplePayToken: (token: string) => void;
    onBlikCode: (code: string) => void;
    onGooglePayToken: (token: string) => void;
    onPaymentMethodChange: (method: PaymentMethodValue) => void;
};
