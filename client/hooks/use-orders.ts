'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { setCartToken } from '@/api/cart';
import type { CheckoutPayload } from '@/api/orders';
import {
    cancelOrder,
    checkout,
    getOrder,
    getOrders,
    getShippingMethods,
    reorder,
} from '@/api/orders';
import { trackPurchase } from '@/lib/datalayer';

export const orderKeys = {
    all: ['orders'] as const,
    list: (page?: number) => ['orders', 'list', page] as const,
    detail: (reference: string) => ['orders', 'detail', reference] as const,
    shippingMethods: ['checkout', 'shipping-methods'] as const,
};

export function useOrders(page = 1) {
    return useQuery({
        queryKey: orderKeys.list(page),
        queryFn: () => getOrders({ page }),
    });
}

export function useOrder(reference: string) {
    return useQuery({
        queryKey: orderKeys.detail(reference),
        queryFn: () => getOrder(reference),
        enabled: !!reference,
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reference: string) => cancelOrder(reference),
        onSuccess: (order) => {
            if (!order) return;
            queryClient.setQueryData(
                orderKeys.detail(order.reference_number),
                order,
            );
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
}

export function useReorder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reference: string) => reorder(reference),
        onSuccess: (data) => {
            if (!data) return;
            if (data.cart_token) {
                setCartToken(data.cart_token);
            }
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

export function useShippingMethods() {
    return useQuery({
        queryKey: orderKeys.shippingMethods,
        queryFn: getShippingMethods,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCheckout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CheckoutPayload) => checkout(payload),
        onSuccess: (order) => {
            if (!order) return;
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            trackPurchase({
                transactionId: order.reference_number,
                revenue: order.total,
                currency: order.currency_code,
                items: order.items.map((i) => ({
                    item_id: i.id,
                    item_name: i.product_name,
                    quantity: i.quantity,
                    price: (i.unit_price / 100).toFixed(2),
                })),
            });
        },
    });
}
