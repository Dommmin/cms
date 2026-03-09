"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCartItem,
  applyDiscount,
  clearCart,
  getCart,
  removeCartItem,
  removeDiscount,
  updateCartItem,
} from "@/api/cart";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/datalayer";

export const cartKeys = {
  cart: ["cart"] as const,
};

export function useCart() {
  return useQuery({
    queryKey: cartKeys.cart,
    queryFn: getCart,
    staleTime: 30 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: (cart, variables) => {
      queryClient.setQueryData(cartKeys.cart, cart);
      const item = cart.items.find((i) => i.variant_id === variables.variant_id);
      if (item) {
        trackAddToCart({
          id: item.variant_id,
          name: item.product.name,
          quantity: variables.quantity,
          price: item.unit_price,
          currency: cart.currency,
        });
      }
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      updateCartItem(id, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.cart, cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const previousCart = () => queryClient.getQueryData<Awaited<ReturnType<typeof getCart>>>(cartKeys.cart);

  return useMutation({
    mutationFn: (cartItemId: number) => {
      const cart = previousCart();
      const item = cart?.items.find((i) => i.id === cartItemId);
      return removeCartItem(cartItemId).then((updatedCart) => {
        if (item) {
          trackRemoveFromCart({
            id: item.variant_id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.unit_price,
            currency: cart?.currency,
          });
        }
        return updatedCart;
      });
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.cart, cart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart });
    },
  });
}

export function useApplyDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => applyDiscount(code),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.cart, cart);
    },
  });
}

export function useRemoveDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeDiscount,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.cart, cart);
    },
  });
}
