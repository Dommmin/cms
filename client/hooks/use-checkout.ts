'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => submitCheckout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart });
    },
  });
}
