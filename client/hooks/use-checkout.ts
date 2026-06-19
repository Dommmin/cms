'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import {
    CheckoutPayload,
    PaymentMethodConfig,
    getPaymentMethods,
    getShippingMethods,
    submitCheckout,
} from '@/api/checkout';
import { cartKeys } from '@/hooks/use-cart';

export function useShippingMethods() {
    return useQuery({
        queryKey: ['shipping-methods'],
        queryFn: getShippingMethods,
        staleTime: 5 * 60 * 1000,
    });
}

export function usePaymentMethods() {
    return useQuery<PaymentMethodConfig[]>({
        queryKey: ['checkout-payment-methods'],
        queryFn: getPaymentMethods,
        staleTime: 60 * 60 * 1000, // config changes only on redeploy
    });
}

export function useCheckout() {
    const queryClient = useQueryClient();

    // One idempotency key per checkout attempt. It survives double-clicks and
    // network retries (so the server deduplicates them) and is only cleared
    // after a successful order, when the next attempt should start fresh.
    const idempotencyKeyRef = useRef<string | null>(null);

    return useMutation({
        mutationFn: (payload: CheckoutPayload) => {
            idempotencyKeyRef.current ??= crypto.randomUUID();

            return submitCheckout(payload, idempotencyKeyRef.current);
        },
        onSuccess: () => {
            idempotencyKeyRef.current = null;
            queryClient.invalidateQueries({ queryKey: cartKeys.cart });
        },
    });
}
