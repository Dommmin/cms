'use client';

import { getFlashSales } from '@/api/products';
import { FlashSaleCountdown } from '@/components/flash-sale-countdown';
import { useLocalePath } from '@/hooks/use-locale';
import { resolveProductPath } from '@/lib/public-paths';
import type { FlashSale, Page } from '@/types/api';
import { motion } from 'framer-motion';
import { Loader2, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface FlashSalesHubModuleProps {
    page: Page;
}

export function FlashSalesHubModule({ page }: FlashSalesHubModuleProps) {
    const lp = useLocalePath();
    const config = page.module_config ?? {};
    const limit = typeof config.limit === 'number' ? config.limit : null;
    const showExpired =
        typeof config.show_expired === 'boolean' ? config.show_expired : false;

    const [sales, setSales] = useState<FlashSale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getFlashSales();
                setSales(data);
            } catch (err) {
                console.error('Failed to load flash sales:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const processedSales = useMemo(() => {
        let items = [...sales];

        // Filter out expired sales if configured not to show them
        if (!showExpired) {
            items = items.filter((sale) => {
                if (!sale.ends_at) return true;
                return new Date(sale.ends_at).getTime() > Date.now();
            });
        }

        // Apply limit if configured
        if (limit !== null && limit > 0) {
            items = items.slice(0, limit);
        }

        return items;
    }, [sales, limit, showExpired]);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="text-primary h-10 w-10 animate-spin" />
                    <p className="text-muted-foreground mt-4 text-sm font-medium">
                        Loading flash deals...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/50 px-4 py-1.5 text-xs font-semibold tracking-wider text-orange-600 uppercase dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Limited Time Offers
                </motion.div>
                <h1 className="from-foreground via-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                    {page.title || 'Flash Sales'}
                </h1>
                {page.excerpt && (
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
                        {page.excerpt}
                    </p>
                )}
            </div>

            {processedSales.length === 0 ? (
                <div className="bg-muted/10 rounded-3xl border border-dashed py-20 text-center">
                    <ShoppingBag className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="text-lg font-semibold">
                        No active flash sales
                    </h3>
                    <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
                        All our current lightning deals have ended. Keep
                        checking back or explore our collections for new offers!
                    </p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {processedSales.map((sale, index) => {
                        const productUrl = sale.product
                            ? lp(resolveProductPath(sale.product))
                            : '#';
                        return (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1,
                                }}
                                className="group border-border bg-card hover:bg-card/80 relative flex flex-col justify-between overflow-hidden rounded-3xl border shadow-sm transition-all hover:shadow-lg"
                            >
                                {/* Countdown Overlay or Header */}
                                <div className="bg-muted/30 p-1.5">
                                    <FlashSaleCountdown
                                        endsAt={sale.ends_at}
                                        name={sale.name}
                                        salePrice={sale.sale_price}
                                        stockRemaining={sale.stock_remaining}
                                    />
                                </div>

                                {/* Product details */}
                                <div className="flex flex-1 flex-col justify-between p-6">
                                    <div className="space-y-3">
                                        {sale.product && (
                                            <div className="space-y-1">
                                                <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                                                    {sale.product.name}
                                                </h3>
                                                {sale.variant && (
                                                    <p className="text-muted-foreground font-mono text-xs">
                                                        SKU: {sale.variant.sku}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {sale.stock_remaining !== null && (
                                            <div className="space-y-1.5">
                                                <div className="text-muted-foreground flex justify-between text-xs font-semibold">
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3 text-orange-500" />
                                                        Stock Status
                                                    </span>
                                                    <span>
                                                        {sale.stock_remaining}{' '}
                                                        units remaining
                                                    </span>
                                                </div>
                                                {/* Mini progress bar simulation */}
                                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                                                        style={{
                                                            width: `${Math.min(100, (sale.stock_remaining / 50) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <div className="mt-6">
                                        <Link
                                            href={productUrl}
                                            className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-all"
                                        >
                                            View Product Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
