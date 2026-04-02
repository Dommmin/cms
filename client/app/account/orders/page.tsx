'use client';

import { Package } from 'lucide-react';
import Link from 'next/link';

import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import { useOrders } from '@/hooks/use-orders';
import { useTranslation } from '@/hooks/use-translation';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
    const { data, isLoading } = useOrders();
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { formatPrice } = useCurrency();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">
                    {t('account.my_orders', 'My Orders')}
                </h1>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-muted h-20 animate-pulse rounded-xl"
                    />
                ))}
            </div>
        );
    }

    const orders = data?.data ?? [];

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">
                {t('account.my_orders', 'My Orders')}
            </h1>

            {orders.length === 0 ? (
                <div className="border-border bg-card rounded-xl border py-16 text-center">
                    <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">
                        {t(
                            'account.no_orders',
                            "You haven't placed any orders yet.",
                        )}
                    </p>
                    <Link
                        href={lp('/products')}
                        className="bg-primary text-primary-foreground mt-4 inline-flex items-center rounded-xl px-6 py-2.5 text-sm font-semibold hover:opacity-90"
                    >
                        {t('account.start_shopping', 'Start Shopping')}
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={lp(
                                `/account/orders/${order.reference_number}`,
                            )}
                            className="border-border bg-card flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md"
                        >
                            <div>
                                <p className="font-medium">
                                    #{order.reference_number}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                    {' · '}
                                    {order.items?.length ?? 0} item
                                    {(order.items?.length ?? 0) !== 1
                                        ? 's'
                                        : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                        STATUS_COLORS[order.status] ??
                                        'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {order.status}
                                </span>
                                <span className="font-semibold">
                                    {formatPrice(order.total)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
