'use client';

import { ArrowLeft, CheckCircle2, Circle, Package, Truck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import { useCancelOrder, useOrder } from '@/hooks/use-orders';
import { useTranslation } from '@/hooks/use-translation';
import { api } from '@/lib/axios';
import type { OrderStatus } from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
};

const STATUS_STEPS: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
];

const RETURN_TYPES = [
    { value: 'return', labelKey: 'order.return_type_return' as const },
    { value: 'exchange', labelKey: 'order.return_type_exchange' as const },
    { value: 'complaint', labelKey: 'order.return_type_complaint' as const },
];

function StatusTimeline({
    status,
    history,
}: {
    status: OrderStatus;
    history?: Array<{
        status: string;
        note: string | null;
        created_at: string;
    }>;
}) {
    const { t } = useTranslation();
    const isCancelled = status === 'cancelled' || status === 'refunded';
    const currentIndex = STATUS_STEPS.indexOf(status);

    if (isCancelled) {
        return (
            <div className="border-border bg-card rounded-xl border p-4">
                <h3 className="mb-3 font-semibold">
                    {t('order.status', 'Order Status')}
                </h3>
                <div className="flex items-center gap-2 text-sm text-red-600">
                    <Circle className="h-4 w-4 fill-red-100" />
                    <span className="font-medium capitalize">{status}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="border-border bg-card rounded-xl border p-4">
            <h3 className="mb-4 font-semibold">
                {t('order.progress', 'Order Progress')}
            </h3>
            <ol className="relative flex items-start justify-between">
                {STATUS_STEPS.map((step, i) => {
                    const isDone = i < currentIndex;
                    const isCurrent = i === currentIndex;
                    const historyEntry = history?.find(
                        (h) => h.status === step,
                    );

                    return (
                        <li
                            key={step}
                            className="relative flex flex-1 flex-col items-center gap-1"
                        >
                            {/* connector line */}
                            {i < STATUS_STEPS.length - 1 && (
                                <span
                                    className={`absolute top-3 left-1/2 h-0.5 w-full -translate-y-1/2 ${
                                        isDone ? 'bg-primary' : 'bg-border'
                                    }`}
                                />
                            )}
                            <span className="bg-background relative z-10 flex h-6 w-6 items-center justify-center rounded-full">
                                {isDone || isCurrent ? (
                                    <CheckCircle2
                                        className={`h-6 w-6 ${isDone ? 'text-primary' : 'text-primary/60'}`}
                                    />
                                ) : (
                                    <Circle className="text-muted-foreground/40 h-6 w-6" />
                                )}
                            </span>
                            <span
                                className={`text-center text-xs capitalize ${
                                    isCurrent
                                        ? 'text-foreground font-semibold'
                                        : isDone
                                          ? 'text-muted-foreground'
                                          : 'text-muted-foreground/50'
                                }`}
                            >
                                {step}
                            </span>
                            {historyEntry && (
                                <span className="text-muted-foreground/70 text-center text-xs">
                                    {new Date(
                                        historyEntry.created_at,
                                    ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

export default function OrderDetailPage() {
    const { reference } = useParams<{ reference: string }>();
    const lp = useLocalePath();
    const { data: order, isLoading } = useOrder(reference);
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
    const { formatPrice } = useCurrency();
    const { t } = useTranslation();

    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnType, setReturnType] = useState('return');
    const [returnReason, setReturnReason] = useState('');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const [returnSuccess, setReturnSuccess] = useState(false);

    function toggleItem(itemId: number) {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId],
        );
    }

    async function handleReturnSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (selectedItems.length === 0) return;
        setIsSubmittingReturn(true);
        try {
            await api.post(`/orders/${reference}/return`, {
                type: returnType,
                reason: returnReason,
                items: selectedItems.map((id) => ({
                    order_item_id: id,
                    quantity: 1,
                })),
            });
            setReturnSuccess(true);
            setShowReturnForm(false);
        } catch {
            // error handled silently
        } finally {
            setIsSubmittingReturn(false);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="bg-muted h-6 w-32 animate-pulse rounded" />
                <div className="bg-muted h-24 animate-pulse rounded-xl" />
                <div className="bg-muted h-40 animate-pulse rounded-xl" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-muted-foreground py-16 text-center">
                {t('order.not_found', 'Order not found.')}{' '}
                <Link href={lp('/account/orders')} className="underline">
                    {t('order.back_to_orders', 'Back to Orders')}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Link
                href={lp('/account/orders')}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                {t('order.back_to_orders', 'Back to Orders')}
            </Link>

            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Order #{order.reference_number}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {t('order.placed', 'Placed')}{' '}
                        {new Date(order.created_at).toLocaleDateString(
                            'en-US',
                            {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            },
                        )}
                    </p>
                </div>
                <span
                    className={`self-start rounded-full px-3 py-1 text-sm font-medium capitalize ${
                        STATUS_COLORS[order.status] ??
                        'bg-muted text-muted-foreground'
                    }`}
                >
                    {order.status_label ?? order.status}
                </span>
            </div>

            {/* Return success */}
            {returnSuccess && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    {t(
                        'order.return_submitted',
                        "Your return request has been submitted. We'll get back to you within 1-2 business days.",
                    )}
                </div>
            )}

            {/* Status timeline */}
            <StatusTimeline
                status={order.status}
                history={order.status_history}
            />

            {/* Shipment tracking */}
            {order.shipment && (
                <div className="border-border bg-card rounded-xl border p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                        <Truck className="text-muted-foreground h-4 w-4" />
                        {t('order.shipment', 'Shipment')}
                    </h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {order.shipment.carrier && (
                            <>
                                <dt className="text-muted-foreground">
                                    {t('order.carrier', 'Carrier')}
                                </dt>
                                <dd className="font-medium">
                                    {order.shipment.carrier}
                                </dd>
                            </>
                        )}
                        {order.shipment.tracking_number && (
                            <>
                                <dt className="text-muted-foreground">
                                    {t('order.tracking', 'Tracking')}
                                </dt>
                                <dd className="font-mono font-medium">
                                    {order.shipment.tracking_url ? (
                                        <a
                                            href={order.shipment.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {order.shipment.tracking_number}
                                        </a>
                                    ) : (
                                        order.shipment.tracking_number
                                    )}
                                </dd>
                            </>
                        )}
                        <dt className="text-muted-foreground">
                            {t('order.status', 'Status')}
                        </dt>
                        <dd className="font-medium capitalize">
                            {order.shipment.status}
                        </dd>
                    </dl>
                </div>
            )}

            {/* Items */}
            <div className="border-border bg-card rounded-xl border">
                <div className="border-border border-b px-4 py-3">
                    <h2 className="font-semibold">
                        {t('order.items', 'Items')}
                    </h2>
                </div>
                <ul className="divide-border divide-y">
                    {order.items?.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <Package className="text-muted-foreground h-8 w-8 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.product_name}
                                    </p>
                                    {item.variant_sku && (
                                        <p className="text-muted-foreground text-xs">
                                            {t('order.sku', 'SKU')}:{' '}
                                            {item.variant_sku}
                                        </p>
                                    )}
                                    <p className="text-muted-foreground text-xs">
                                        {t('order.qty', 'Qty')}: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm font-medium">
                                {formatPrice(item.subtotal)}
                            </p>
                        </li>
                    ))}
                </ul>
                <div className="border-border space-y-1 border-t px-4 py-3 text-sm">
                    <div className="text-muted-foreground flex justify-between">
                        <span>{t('order.subtotal', 'Subtotal')}</span>
                        <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.shipping_cost > 0 && (
                        <div className="text-muted-foreground flex justify-between">
                            <span>{t('order.shipping', 'Shipping')}</span>
                            <span>{formatPrice(order.shipping_cost)}</span>
                        </div>
                    )}
                    {order.tax_amount > 0 && (
                        <div className="text-muted-foreground flex justify-between">
                            <span>{t('order.tax', 'Tax')}</span>
                            <span>{formatPrice(order.tax_amount)}</span>
                        </div>
                    )}
                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>{t('order.discount', 'Discount')}</span>
                            <span>-{formatPrice(order.discount_amount)}</span>
                        </div>
                    )}
                    <div className="border-border flex justify-between border-t pt-1 font-semibold">
                        <span>{t('order.total', 'Total')}</span>
                        <span>{formatPrice(order.total)}</span>
                    </div>
                </div>
            </div>

            {/* Addresses */}
            {(order.shipping_address || order.billing_address) && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {order.shipping_address && (
                        <div className="border-border bg-card rounded-xl border p-4">
                            <h3 className="mb-2 text-sm font-semibold">
                                {t(
                                    'order.shipping_address',
                                    'Shipping Address',
                                )}
                            </h3>
                            <address className="text-muted-foreground text-sm leading-relaxed not-italic">
                                {order.shipping_address.first_name}{' '}
                                {order.shipping_address.last_name}
                                <br />
                                {order.shipping_address.street}
                                <br />
                                {order.shipping_address.street2 && (
                                    <>
                                        {order.shipping_address.street2}
                                        <br />
                                    </>
                                )}
                                {order.shipping_address.city},{' '}
                                {order.shipping_address.postal_code}
                                <br />
                                {order.shipping_address.country_code}
                            </address>
                        </div>
                    )}
                    {order.billing_address && (
                        <div className="border-border bg-card rounded-xl border p-4">
                            <h3 className="mb-2 text-sm font-semibold">
                                {t('order.billing_address', 'Billing Address')}
                            </h3>
                            <address className="text-muted-foreground text-sm leading-relaxed not-italic">
                                {order.billing_address.first_name}{' '}
                                {order.billing_address.last_name}
                                <br />
                                {order.billing_address.street}
                                <br />
                                {order.billing_address.street2 && (
                                    <>
                                        {order.billing_address.street2}
                                        <br />
                                    </>
                                )}
                                {order.billing_address.city},{' '}
                                {order.billing_address.postal_code}
                                <br />
                                {order.billing_address.country_code}
                            </address>
                        </div>
                    )}
                </div>
            )}

            {/* Payment */}
            {order.payment && (
                <div className="border-border bg-card rounded-xl border p-4">
                    <h3 className="mb-2 text-sm font-semibold">
                        {t('order.payment', 'Payment')}
                    </h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <dt className="text-muted-foreground">
                            {t('order.payment_method', 'Method')}
                        </dt>
                        <dd className="capitalize">{order.payment.method}</dd>
                        <dt className="text-muted-foreground">
                            {t('order.payment_status', 'Status')}
                        </dt>
                        <dd className="capitalize">{order.payment.status}</dd>
                    </dl>
                </div>
            )}

            {/* Actions */}
            {['pending', 'processing'].includes(order.status) && (
                <div>
                    <button
                        onClick={() => cancelOrder(reference)}
                        disabled={isCancelling}
                        className="border-destructive text-destructive hover:bg-destructive/10 rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        {isCancelling
                            ? t('order.cancelling', 'Cancelling…')
                            : t('order.cancel', 'Cancel Order')}
                    </button>
                </div>
            )}

            {['delivered', 'shipped'].includes(order.status) &&
                !returnSuccess && (
                    <div>
                        <button
                            onClick={() => setShowReturnForm(!showReturnForm)}
                            className="border-input hover:bg-accent rounded-xl border px-4 py-2 text-sm font-medium"
                        >
                            {showReturnForm
                                ? t(
                                      'order.hide_return_form',
                                      'Hide Return Form',
                                  )
                                : t(
                                      'order.show_return_form',
                                      'Request Return / Complaint',
                                  )}
                        </button>
                    </div>
                )}

            {/* Return form */}
            {showReturnForm && (
                <form
                    onSubmit={handleReturnSubmit}
                    className="border-border bg-card rounded-xl border p-4"
                >
                    <h3 className="mb-4 font-semibold">
                        {t(
                            'order.return_request',
                            'Return / Complaint Request',
                        )}
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium">
                            {t('order.request_type', 'Request Type')}
                        </label>
                        <div className="flex gap-3">
                            {RETURN_TYPES.map(({ value, labelKey }) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-1.5 text-sm"
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={value}
                                        checked={returnType === value}
                                        onChange={() => setReturnType(value)}
                                    />
                                    {t(labelKey, value)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium">
                            {t('order.select_items', 'Select Items')}
                        </label>
                        <div className="space-y-2">
                            {order.items?.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(
                                            item.id,
                                        )}
                                        onChange={() => toggleItem(item.id)}
                                    />
                                    {item.product_name}
                                    {item.variant_sku
                                        ? ` (${item.variant_sku})`
                                        : ''}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="reason"
                            className="mb-1 block text-sm font-medium"
                        >
                            {t('order.reason', 'Reason')}
                        </label>
                        <textarea
                            id="reason"
                            required
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            rows={3}
                            placeholder={t(
                                'order.reason',
                                'Please describe the reason for your return/complaint…',
                            )}
                            className="border-input bg-background focus:ring-ring w-full rounded-xl border px-4 py-2 text-sm focus:ring-2 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={
                            isSubmittingReturn || selectedItems.length === 0
                        }
                        className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                        {isSubmittingReturn
                            ? t('order.submitting', 'Submitting…')
                            : t('order.submit_request', 'Submit Request')}
                    </button>
                </form>
            )}
        </div>
    );
}
