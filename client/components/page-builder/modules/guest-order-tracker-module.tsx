'use client';

import { trackGuestOrder } from '@/api/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import type { GuestOrderTrackingResult, OrderStatus, Page } from '@/types/api';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ExternalLink,
    Loader2,
    Search,
    ShoppingBag,
    Truck,
} from 'lucide-react';
import { useState } from 'react';

interface GuestOrderTrackerModuleProps {
    page: Page;
}

const ORDER_STEPS: {
    status: OrderStatus;
    label: string;
    description: string;
}[] = [
    {
        status: 'pending',
        label: 'Order Placed',
        description: 'We received your order.',
    },
    { status: 'paid', label: 'Paid', description: 'Payment confirmed.' },
    {
        status: 'processing',
        label: 'Processing',
        description: 'Preparing items for shipping.',
    },
    {
        status: 'shipped',
        label: 'Shipped',
        description: 'In transit to destination.',
    },
    {
        status: 'delivered',
        label: 'Delivered',
        description: 'Package has been delivered.',
    },
];

function getStepIndex(status: OrderStatus): number {
    switch (status) {
        case 'draft':
        case 'pending':
        case 'awaiting_payment':
            return 0;
        case 'paid':
        case 'confirmed':
            return 1;
        case 'processing':
            return 2;
        case 'shipped':
            return 3;
        case 'delivered':
            return 4;
        default:
            return 0; // fallback for cancelled / refunded
    }
}

function formatPrice(cents: number, currency: string): string {
    return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function GuestOrderTrackerModule({
    page,
}: GuestOrderTrackerModuleProps) {
    const { t } = useTranslation();
    const [referenceNumber, setReferenceNumber] = useState('');
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<GuestOrderTrackingResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await trackGuestOrder({
                reference_number: referenceNumber.trim(),
                email: email.trim(),
            });

            if (data) {
                setResult(data);
            } else {
                setError(
                    t(
                        'orders.not_found',
                        'No order found with the provided details.',
                    ),
                );
            }
        } catch (err) {
            console.error('Tracking failed:', err);
            if (isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(
                    t(
                        'orders.tracking_error',
                        'Failed to retrieve order tracking. Check reference number and email.',
                    ),
                );
            }
        } finally {
            setLoading(false);
        }
    }

    const currentStepIndex = result ? getStepIndex(result.status) : 0;
    const isCancelled = result?.status === 'cancelled';
    const isRefunded = result?.status === 'refunded';

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {page.title || 'Track Guest Order'}
                </h1>
                {page.excerpt && (
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
                        {page.excerpt}
                    </p>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                {/* Search Sidebar */}
                <div>
                    <div className="border-border bg-card/60 space-y-5 rounded-3xl border p-6 shadow-sm backdrop-blur-md">
                        <div>
                            <h2 className="text-xl font-semibold">
                                Track Order
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs leading-normal">
                                Enter your order reference code (e.g.
                                ORD-XXXXXX) and your billing email address.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="ref"
                                    className="text-sm font-medium"
                                >
                                    Reference Number
                                </label>
                                <Input
                                    id="ref"
                                    type="text"
                                    required
                                    placeholder="ORD-123456"
                                    value={referenceNumber}
                                    onChange={(e) =>
                                        setReferenceNumber(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="tracking-email"
                                    className="text-sm font-medium"
                                >
                                    Email Address
                                </label>
                                <Input
                                    id="tracking-email"
                                    type="email"
                                    required
                                    placeholder="your-email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="text-destructive bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-xl border p-3 text-xs">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="h-11 w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" />
                                        Track Order
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Result Display */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-muted-foreground bg-muted/5 flex h-full flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center"
                            >
                                <ShoppingBag className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                <h3 className="text-lg font-semibold">
                                    No order currently tracked
                                </h3>
                                <p className="mt-1 max-w-sm text-sm">
                                    Enter your order reference number and email
                                    on the left to see its active fulfillment
                                    status.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result-state"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="space-y-6"
                            >
                                {/* Header summary */}
                                <div className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-6 shadow-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                            Order Details
                                        </p>
                                        <h3 className="text-foreground mt-1 text-2xl font-bold">
                                            #{result.reference_number}
                                        </h3>
                                        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>
                                                Placed:{' '}
                                                {new Date(
                                                    result.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase ${
                                                isCancelled || isRefunded
                                                    ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                                                    : result.status ===
                                                        'delivered'
                                                      ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                                      : 'bg-primary/10 text-primary'
                                            }`}
                                        >
                                            {result.status.replace(/_/g, ' ')}
                                        </span>
                                        <p className="mt-1.5 text-lg font-bold">
                                            Total:{' '}
                                            {formatPrice(
                                                result.total,
                                                result.currency_code,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Graphical Timeline */}
                                <div className="border-border bg-card rounded-3xl border p-6 shadow-sm">
                                    <h3 className="mb-6 font-semibold">
                                        Delivery Timeline
                                    </h3>

                                    {isCancelled || isRefunded ? (
                                        <div className="rounded-2xl border border-red-200/50 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-900/20 dark:bg-red-950/10 dark:text-red-400">
                                            This order was {result.status}. If
                                            you have any questions, please
                                            contact our support team.
                                        </div>
                                    ) : (
                                        <div className="relative items-start gap-4 pl-6 sm:flex sm:justify-between sm:pl-0">
                                            {/* Line across steps for desktop */}
                                            <div className="bg-border absolute top-3 bottom-3 left-3 w-0.5 sm:hidden" />
                                            <div className="bg-border absolute top-[22px] right-6 left-6 hidden h-0.5 sm:block" />

                                            {ORDER_STEPS.map((step, idx) => {
                                                const isDone =
                                                    idx <= currentStepIndex;
                                                const isCurrent =
                                                    idx === currentStepIndex;

                                                return (
                                                    <div
                                                        key={step.status}
                                                        className={`relative flex flex-1 items-start gap-4 pb-6 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center ${
                                                            isDone
                                                                ? 'text-foreground'
                                                                : 'text-muted-foreground/50'
                                                        }`}
                                                    >
                                                        {/* Step indicator dot */}
                                                        <div
                                                            className={`z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all ${
                                                                isDone
                                                                    ? 'bg-background border-primary text-primary scale-110 shadow-sm'
                                                                    : 'bg-background border-border text-muted-foreground/30'
                                                            }`}
                                                        >
                                                            {isDone &&
                                                            idx <
                                                                currentStepIndex ? (
                                                                <CheckCircle2 className="fill-primary text-background h-5 w-5" />
                                                            ) : isCurrent ? (
                                                                <div className="bg-primary size-3 animate-pulse rounded-full" />
                                                            ) : (
                                                                <span className="text-xs font-semibold">
                                                                    {idx + 1}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Step label / details */}
                                                        <div className="sm:mt-2">
                                                            <p
                                                                className={`text-sm font-bold ${isCurrent ? 'text-primary' : ''}`}
                                                            >
                                                                {step.label}
                                                            </p>
                                                            <p className="text-muted-foreground mx-auto mt-1 hidden max-w-[150px] text-xs sm:block">
                                                                {
                                                                    step.description
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Carrier Details */}
                                {result.shipment && (
                                    <div className="border-border bg-card flex items-start gap-4 rounded-3xl border p-6 shadow-sm">
                                        <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                                            <Truck className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <h4 className="text-foreground text-base font-semibold">
                                                Package Tracking
                                            </h4>
                                            <p className="text-muted-foreground text-sm leading-normal">
                                                Carrier:{' '}
                                                <strong className="text-foreground">
                                                    {result.shipment.carrier}
                                                </strong>
                                                {result.shipment.shipped_at && (
                                                    <span>
                                                        {' '}
                                                        • Shipped on:{' '}
                                                        {new Date(
                                                            result.shipment
                                                                .shipped_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </p>
                                            {result.shipment
                                                .tracking_number && (
                                                <div className="mt-3 flex items-center gap-3 pt-2">
                                                    <span className="bg-muted text-foreground rounded-lg border px-2.5 py-1 font-mono text-xs">
                                                        Tracking:{' '}
                                                        {
                                                            result.shipment
                                                                .tracking_number
                                                        }
                                                    </span>
                                                    {result.shipment
                                                        .tracking_url && (
                                                        <a
                                                            href={
                                                                result.shipment
                                                                    .tracking_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
                                                        >
                                                            Track package
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Items list & prices breakdown */}
                                <div className="border-border bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
                                    <h3 className="font-semibold">
                                        Items List
                                    </h3>
                                    <ul className="divide-border/60 divide-y">
                                        {result.items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex items-center justify-between gap-3 py-4"
                                            >
                                                <div>
                                                    <p className="text-foreground text-sm font-semibold">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                                        SKU: {item.variant_sku}{' '}
                                                        • Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <span className="text-foreground text-sm font-bold">
                                                    {formatPrice(
                                                        item.unit_price *
                                                            item.quantity,
                                                        result.currency_code,
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="space-y-2 border-t pt-4 text-sm">
                                        <div className="text-muted-foreground flex justify-between">
                                            <span>Subtotal</span>
                                            <span>
                                                {formatPrice(
                                                    result.subtotal,
                                                    result.currency_code,
                                                )}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground flex justify-between">
                                            <span>Shipping</span>
                                            <span>
                                                {formatPrice(
                                                    result.shipping_cost,
                                                    result.currency_code,
                                                )}
                                            </span>
                                        </div>
                                        {result.discount_amount > 0 && (
                                            <div className="flex justify-between font-semibold text-green-600 dark:text-green-400">
                                                <span>Discount</span>
                                                <span>
                                                    -
                                                    {formatPrice(
                                                        result.discount_amount,
                                                        result.currency_code,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-foreground mt-2 flex justify-between border-t pt-2 text-base font-bold">
                                            <span>Total Amount</span>
                                            <span>
                                                {formatPrice(
                                                    result.total,
                                                    result.currency_code,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
