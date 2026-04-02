'use client';

import { api } from '@/lib/axios';
import { useEffect, useState } from 'react';
import type { ApplePayButtonProps } from './apple-pay-button.types';

export function ApplePayButton({
    amount,
    currency,
    onToken,
}: ApplePayButtonProps) {
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            window.ApplePaySession?.canMakePayments()
        ) {
            void Promise.resolve().then(() => setIsAvailable(true));
        }
    }, []);

    if (!isAvailable) return null;

    function handleClick() {
        const request = {
            countryCode: 'PL',
            currencyCode: currency.toUpperCase(),
            supportedNetworks: ['visa', 'masterCard'],
            merchantCapabilities: ['supports3DS'],
            total: {
                label: 'Zamówienie',
                amount: (amount / 100).toFixed(2),
            },
        };

        const session = new window.ApplePaySession!(
            3,
            request,
        ) as ApplePaySessionInstance;

        session.onvalidatemerchant = async (event) => {
            try {
                const { data } = await api.post(
                    '/payments/apple-pay/validate-merchant',
                    {
                        validation_url: event.validationURL,
                        domain: window.location.hostname,
                    },
                );
                session.completeMerchantValidation(data);
            } catch {
                session.completeMerchantValidation({});
            }
        };

        session.onpaymentauthorized = (event) => {
            const tokenData = JSON.stringify(event.payment.token.paymentData);
            onToken(tokenData);
            session.completePayment(0); // STATUS_SUCCESS = 0
        };

        session.oncancel = () => {};

        session.begin();
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90"
            style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
        >
            <span className="mr-1.5 text-base">🍎</span> Pay
        </button>
    );
}
