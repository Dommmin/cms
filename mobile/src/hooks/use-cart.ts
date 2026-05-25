import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as cartApi from '@/api/cart';
import type { Cart } from '@/types/api';

const cartKey = ['cart'];

export function useCart() {
  const queryClient = useQueryClient();
  const cartQuery = useQuery({
    queryKey: cartKey,
    queryFn: cartApi.getCart,
  });

  const setCart = (cart: Cart) => queryClient.setQueryData(cartKey, cart);

  const addItem = useMutation({
    mutationFn: cartApi.addCartItem,
    onSuccess: setCart,
  });

  const updateItem = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      cartApi.updateCartItem(id, quantity),
    onSuccess: setCart,
  });

  const removeItem = useMutation({
    mutationFn: cartApi.removeCartItem,
    onSuccess: setCart,
  });

  return {
    cart: cartQuery.data ?? null,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    refetch: cartQuery.refetch,
    addItem,
    updateItem,
    removeItem,
  };
}
