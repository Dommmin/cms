'use client';

import { FlashSaleCountdown } from '@/components/flash-sale-countdown';
import { useLocalePath } from '@/hooks/use-locale';
import { api } from '@/lib/axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FlashSalesResponse } from './page.types';

export default function FlashSalesClient() {
    const lp = useLocalePath();
    const [data, setData] = useState<FlashSalesResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<FlashSalesResponse>('/flash-sales')
            .then((res) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-muted h-24 animate-pulse rounded-lg"
                        />
                    ))}
                </div>
            </div>
        );
    }

    const sales = data?.data ?? [];

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Flash Sales</h1>
                <p className="text-muted-foreground mt-1">
                    Limited-time deals — act fast!
                </p>
            </div>

            {sales.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-muted-foreground text-lg">
                        No active flash sales right now. Check back soon!
                    </p>
                    <Link
                        href={lp('/products')}
                        className="mt-4 inline-block text-sm underline"
                    >
                        Browse all products
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {sales.map((sale) => (
                        <div
                            key={sale.id}
                            className="bg-card rounded-xl border p-6 shadow-sm"
                        >
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {sale.name}
                                    </h2>
                                    {sale.product && (
                                        <Link
                                            href={lp(
                                                `/products/${sale.product.slug}`,
                                            )}
                                            className="text-muted-foreground mt-1 text-sm hover:underline"
                                        >
                                            {sale.product.name}
                                            {sale.variant
                                                ? ` — ${sale.variant.sku}`
                                                : ''}
                                        </Link>
                                    )}
                                </div>
                                {sale.product && (
                                    <Link
                                        href={lp(
                                            `/products/${sale.product.slug}`,
                                        )}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
                                    >
                                        Shop now
                                    </Link>
                                )}
                            </div>

                            <FlashSaleCountdown
                                endsAt={sale.ends_at}
                                name={sale.name}
                                salePrice={sale.sale_price}
                                stockRemaining={sale.stock_remaining}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
