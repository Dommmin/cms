'use client';

import { PaymentStep } from '@/components/checkout/payment-step';

import type { CheckoutPaymentSectionProps } from '../checkout.types';

export function CheckoutPaymentSection({
    blikCode,
    currencyCode,
    isPickup,
    paymentMethod,
    paymentMethods,
    total,
    onApplePayToken,
    onBlikCode,
    onGooglePayToken,
    onPaymentMethodChange,
}: CheckoutPaymentSectionProps) {
    return (
        <PaymentStep
            selected={paymentMethod}
            onSelect={onPaymentMethodChange}
            blikCode={blikCode}
            onBlikCode={onBlikCode}
            onApplePayToken={onApplePayToken}
            onGooglePayToken={onGooglePayToken}
            cartTotal={total}
            currency={currencyCode}
            providerConfig={paymentMethods}
            isPickup={isPickup}
        />
    );
}
