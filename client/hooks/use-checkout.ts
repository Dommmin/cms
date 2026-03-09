"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CheckoutPayload,
  getShippingMethods,
  submitCheckout,
} from "@/api/checkout";
import { cartKeys } from "@/hooks/use-cart";

export function useShippingMethods() {
  return useQuery({
    queryKey: ["shipping-methods"],
    queryFn: getShippingMethods,
    staleTime: 5 * 60 * 1000,
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
