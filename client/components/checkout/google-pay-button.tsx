'use client';

import { useEffect, useRef, useState } from 'react';
import type { GooglePayButtonProps } from './google-pay-button.types';

export function GooglePayButton({
    amount,
    currency,
    onToken,
}: GooglePayButtonProps) {
    const [isReady, setIsReady] = useState(false);
    const clientRef = useRef<GooglePayClient | null>(null);

    function getPaymentMethod() {
        return {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'payu',
                    gatewayMerchantId:
                        process.env.NEXT_PUBLIC_PAYU_POS_ID ?? '',
                },
            },
        };
    }

    function initClient() {
        if (!window.google?.payments?.api) return;

        const client = new window.google.payments.api.PaymentsClient({
            environment: 'TEST',
        });
        clientRef.current = client;

        client
            .isReadyToPay({
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [getPaymentMethod()],
            })
            .then(({ result }) => setIsReady(result))
            .catch(() => setIsReady(false));
    }

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const existingScript = document.querySelector(
            'script[src*="pay.google.com"]',
        );
        if (existingScript) {
            initClient();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.onload = () => initClient();
        document.head.appendChild(script);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleClick() {
        if (!clientRef.current) return;

        try {
            const paymentData = await clientRef.current.loadPaymentData({
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [getPaymentMethod()],
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: (amount / 100).toFixed(2),
                    currencyCode: currency.toUpperCase(),
                    countryCode: 'PL',
                },
                merchantInfo: {
                    merchantName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Sklep',
                },
            });

            onToken(paymentData.paymentMethodData.tokenizationData.token);
        } catch {
            // User cancelled
        }
    }

    if (!isReady) return null;

    return (
        <button
            type="button"
            onClick={handleClick}
            className="border-border flex w-full items-center justify-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
        >
            <svg viewBox="0 0 48 20" className="h-5 w-auto" aria-hidden="true">
                <path
                    fill="#4285F4"
                    d="M18.8 10c0-.6-.1-1.3-.2-1.8h-8.4v3.4h4.8c-.2 1.1-.9 2.1-1.8 2.7v2.2h3c1.7-1.6 2.6-4 2.6-6.5z"
                />
                <path
                    fill="#34A853"
                    d="M10.2 19.6c2.4 0 4.5-.8 6-2.1l-3-2.2c-.8.5-1.8.8-3 .8-2.3 0-4.3-1.6-5-3.7H2.1v2.3c1.5 3 4.5 4.9 8.1 4.9z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.2 12.4c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8V6.5H2.1A9.5 9.5 0 0 0 .8 10.6c0 1.5.4 3 1.3 4.1l3.1-2.3z"
                />
                <path
                    fill="#EA4335"
                    d="M10.2 4.9c1.3 0 2.5.5 3.4 1.3l2.5-2.5C14.7 2.3 12.6 1.4 10.2 1.4 6.6 1.4 3.6 3.3 2.1 6.5l3.1 2.3c.7-2.2 2.7-3.9 5-3.9z"
                />
            </svg>
            Pay
        </button>
    );
}
