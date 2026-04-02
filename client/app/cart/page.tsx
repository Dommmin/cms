'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { PriceDisplay } from '@/components/price-display';
import {
    useCart,
    useRemoveCartItem,
    useUpdateCartItem,
} from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { getToken } from '@/lib/axios';

export default function CartPage() {
    const { data: cart, isLoading } = useCart();
    const { mutate: updateItem } = useUpdateCartItem();
    const { mutate: removeItem } = useRemoveCartItem();
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { formatPrice } = useCurrency();
    const token = getToken();
    const checkoutHref = lp(token ? '/checkout' : '/checkout/options');

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold">
                    {t('cart.your_cart', 'Your Cart')}
                </h1>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-muted h-24 animate-pulse rounded-xl"
                        />
                    ))}
                </div>
            </div>
        );
    }

    const items = cart?.items ?? [];

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
                <h1 className="mb-4 text-3xl font-bold">
                    {t('cart.your_cart', 'Your Cart')}
                </h1>
                <p className="text-muted-foreground mb-8">
                    {t('cart.empty_desc', 'Your cart is empty.')}
                </p>
                <Link
                    href={lp('/products')}
                    className="bg-primary text-primary-foreground inline-flex items-center rounded-xl px-6 py-3 font-semibold hover:opacity-90"
                >
                    {t('cart.start_shopping', 'Start Shopping')}
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-3xl font-bold">
                {t('cart.your_cart', 'Your Cart')}
            </h1>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Items list */}
                <div className="lg:col-span-2">
                    <ul className="divide-border border-border divide-y rounded-xl border">
                        {items.map((item) => (
                            <li key={item.id} className="flex gap-4 p-4">
                                {/* Image */}
                                <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                                    {item.product?.thumbnail?.url ? (
                                        <Image
                                            src={item.product.thumbnail.url}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                                            No img
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex flex-1 flex-col gap-1">
                                    <Link
                                        href={lp(
                                            `/products/${item.product?.slug ?? ''}`,
                                        )}
                                        className="leading-tight font-medium hover:underline"
                                    >
                                        {item.product?.name ?? 'Product'}
                                    </Link>
                                    {item.variant?.sku && (
                                        <p className="text-muted-foreground text-xs">
                                            SKU: {item.variant.sku}
                                        </p>
                                    )}
                                    <PriceDisplay
                                        price={item.unit_price}
                                        compareAtPrice={
                                            item.variant?.compare_at_price
                                        }
                                        size="sm"
                                    />

                                    {/* Quantity stepper */}
                                    <div className="mt-1 flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                updateItem({
                                                    id: item.id,
                                                    quantity: item.quantity - 1,
                                                })
                                            }
                                            disabled={item.quantity <= 1}
                                            aria-label={t(
                                                'cart.decrease_quantity',
                                                'Decrease quantity',
                                            )}
                                            className="border-input hover:bg-accent inline-flex h-7 w-7 items-center justify-center rounded-md border disabled:opacity-40"
                                        >
                                            <Minus
                                                className="h-3 w-3"
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <span
                                            className="w-6 text-center text-sm"
                                            aria-live="polite"
                                            aria-atomic="true"
                                        >
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateItem({
                                                    id: item.id,
                                                    quantity: item.quantity + 1,
                                                })
                                            }
                                            aria-label={t(
                                                'cart.increase_quantity',
                                                'Increase quantity',
                                            )}
                                            className="border-input hover:bg-accent inline-flex h-7 w-7 items-center justify-center rounded-md border"
                                        >
                                            <Plus
                                                className="h-3 w-3"
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            aria-label={t(
                                                'cart.remove_item',
                                                'Remove item',
                                            )}
                                            className="text-muted-foreground hover:text-destructive ml-2"
                                        >
                                            <Trash2
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Line total */}
                                <p className="shrink-0 font-medium">
                                    {formatPrice(item.subtotal)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Summary */}
                <div className="border-border bg-card rounded-xl border p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        {t('cart.order_summary', 'Order Summary')}
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t('cart.subtotal', 'Subtotal')}
                            </span>
                            <span>{formatPrice(cart?.subtotal ?? 0)}</span>
                        </div>
                        {(cart?.discount_amount ?? 0) > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>{t('cart.discount', 'Discount')}</span>
                                <span>
                                    -{formatPrice(cart!.discount_amount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t('cart.shipping', 'Shipping')}
                            </span>
                            <span className="text-muted-foreground">
                                {t(
                                    'cart.calculated_at_checkout',
                                    'Calculated at checkout',
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="border-border my-4 border-t pt-4">
                        <div className="flex justify-between font-semibold">
                            <span>{t('cart.total', 'Total')}</span>
                            <span>{formatPrice(cart?.total ?? 0)}</span>
                        </div>
                    </div>
                    <Link
                        href={checkoutHref}
                        className="bg-primary text-primary-foreground block w-full rounded-xl py-3 text-center font-semibold hover:opacity-90"
                    >
                        {t('cart.proceed', 'Proceed to Checkout')}
                    </Link>
                    <Link
                        href={lp('/products')}
                        className="text-muted-foreground hover:text-foreground mt-3 block text-center text-sm"
                    >
                        {t('cart.continue_shopping', 'Continue Shopping')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
