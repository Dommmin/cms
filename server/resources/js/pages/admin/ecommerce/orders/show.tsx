import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Package,
    PackageCheck,
    Truck,
    Ban,
    RefreshCcw,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader, PageHeaderActions } from '@/components/page-header';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { Address, Customer, OrderItem, Payment, Shipment, StatusHistory, StatusOption, OrderView } from './show.types';

// ── Types ──────────────────────────────────────────────────────────────────

// ── Status config ─────────────────────────────────────────────────────────

const STATUS_ICONS: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    awaiting_payment: <Clock className="h-4 w-4" />,
    paid: <CheckCircle2 className="h-4 w-4" />,
    processing: <Package className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <PackageCheck className="h-4 w-4" />,
    cancelled: <Ban className="h-4 w-4" />,
    refunded: <RefreshCcw className="h-4 w-4" />,
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    awaiting_payment: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
};

// Which statuses can we transition to from a given status?
const STATUS_TRANSITIONS: Record<string, string[]> = {
    pending: ['processing', 'cancelled'],
    awaiting_payment: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled', 'refunded'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: [],
};

// ── Status update modal ────────────────────────────────────────────────────

function StatusModal({
    order,
    targetStatus,
    statusOptions,
    onClose,
}: {
    order: OrderView;
    targetStatus: string;
    statusOptions: StatusOption[];
    onClose: () => void;
}) {
    const __ = useTranslation();
    const label =
        statusOptions.find((s) => s.value === targetStatus)?.label ??
        targetStatus;
    const { data, setData, patch, processing, errors } = useForm({
        status: targetStatus,
        notes: '',
        tracking_number: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/admin/ecommerce/orders/${order.id}/status`, {
            onSuccess: onClose,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
                <h2 className="mb-1 text-lg font-semibold">
                    {__('dialog.change_order_status', 'Change Order Status')}
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    {__('misc.order', 'Order')} #{order.reference_number} →{' '}
                    <strong>{label}</strong>
                </p>

                <form onSubmit={submit} className="space-y-4">
                    {targetStatus === 'shipped' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                {__(
                                    'label.tracking_number_optional',
                                    'Tracking Number (optional)',
                                )}
                            </label>
                            <input
                                type="text"
                                value={data.tracking_number}
                                onChange={(e) =>
                                    setData('tracking_number', e.target.value)
                                }
                                placeholder="np. 1234567890"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                            />
                        </div>
                    )}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            {__('label.note_optional', 'Note (optional)')}
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={2}
                            maxLength={500}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                        />
                        {errors.notes && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                        >
                            {__('action.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                            {processing
                                ? __('misc.saving', 'Saving...')
                                : __('action.confirm', 'Confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function OrderShow({
    order,
    statuses,
}: {
    order: OrderView;
    statuses: StatusOption[];
}) {
    const [modalStatus, setModalStatus] = useState<string | null>(null);
    const __ = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('page.orders', 'Orders'), href: '/admin/ecommerce/orders' },
        {
            title: `#${order.reference_number}`,
            href: `/admin/ecommerce/orders/${order.id}`,
        },
    ];

    const fmt = (cents: number) =>
        new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: order.currency_code || 'PLN',
        }).format(cents / 100);

    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const statusColor =
        STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700';
    const statusLabel =
        statuses.find((s) => s.value === order.status)?.label ?? order.status;
    const possibleTransitions = STATUS_TRANSITIONS[order.status] ?? [];

    const customerName =
        order.customer?.user?.name ??
        (`${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`.trim() ||
            __('misc.guest', 'Guest'));
    const customerEmail =
        order.customer?.user?.email ?? order.customer?.email ?? '';

    const fmtAddress = (a?: Address) =>
        a
            ? `${a.first_name} ${a.last_name}, ${a.street}, ${a.postal_code} ${a.city}`
            : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${__('misc.order', 'Order')} #${order.reference_number}`}
            />

            {modalStatus && (
                <StatusModal
                    order={order}
                    targetStatus={modalStatus}
                    statusOptions={statuses}
                    onClose={() => setModalStatus(null)}
                />
            )}

            <Wrapper>
                <PageHeader
                    title={`${__('misc.order', 'Order')} #${order.reference_number}`}
                    description={`${customerName} · ${fmtDate(order.created_at)}`}
                >
                    <PageHeaderActions>
                        <Link
                            href="/admin/ecommerce/orders"
                            prefetch
                            cacheFor={30}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {__('action.back', 'Back')}
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ── Left (2/3): main info ── */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Status + transitions */}
                        <div className="rounded-xl border border-border p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                                            statusColor,
                                        )}
                                    >
                                        {STATUS_ICONS[order.status]}
                                        {statusLabel}
                                    </span>
                                </div>
                                {possibleTransitions.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {possibleTransitions.map((ts) => {
                                            const opt = statuses.find(
                                                (s) => s.value === ts,
                                            );
                                            return (
                                                <button
                                                    key={ts}
                                                    onClick={() =>
                                                        setModalStatus(ts)
                                                    }
                                                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                                                >
                                                    → {opt?.label ?? ts}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order items */}
                        <div className="rounded-xl border border-border">
                            <div className="border-b border-border px-5 py-3">
                                <h2 className="font-semibold">
                                    {__('misc.products', 'Products')} (
                                    {order.items?.length ?? 0})
                                </h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-2.5 text-left font-medium">
                                            {__('column.product', 'Product')}
                                        </th>
                                        <th className="px-3 py-2.5 text-right font-medium">
                                            {__('column.price', 'Price')}
                                        </th>
                                        <th className="px-3 py-2.5 text-right font-medium">
                                            {__('column.qty', 'Qty')}
                                        </th>
                                        <th className="px-5 py-2.5 text-right font-medium">
                                            {__('column.total', 'Total')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(order.items ?? []).map((item) => {
                                        const name =
                                            item.variant?.product?.name ??
                                            item.product_name ??
                                            __('misc.product', 'Product');
                                        const attrs = item.variant?.attributes
                                            ? Object.entries(
                                                  item.variant.attributes,
                                              )
                                                  .map(([k, v]) => `${k}: ${v}`)
                                                  .join(', ')
                                            : null;
                                        return (
                                            <tr key={item.id}>
                                                <td className="px-5 py-3">
                                                    <p className="font-medium">
                                                        {name}
                                                    </p>
                                                    {attrs && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {attrs}
                                                        </p>
                                                    )}
                                                    {(item.sku ||
                                                        item.variant?.sku) && (
                                                        <p className="text-xs text-muted-foreground">
                                                            SKU:{' '}
                                                            {item.sku ??
                                                                item.variant
                                                                    ?.sku}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-right text-muted-foreground">
                                                    {fmt(item.unit_price)}
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-5 py-3 text-right font-medium">
                                                    {fmt(item.subtotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="border-t border-border px-5 py-4">
                                <div className="ml-auto max-w-xs space-y-1.5 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>
                                            {__('misc.products', 'Products')}
                                        </span>
                                        <span>{fmt(order.subtotal)}</span>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>
                                                {__(
                                                    'misc.discount',
                                                    'Discount',
                                                )}
                                            </span>
                                            <span>
                                                -{fmt(order.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>
                                            {__('misc.shipping', 'Shipping')}
                                        </span>
                                        <span>{fmt(order.shipping_cost)}</span>
                                    </div>
                                    {order.tax_amount > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>{__('misc.tax', 'Tax')}</span>
                                            <span>{fmt(order.tax_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-border pt-2 font-bold">
                                        <span>{__('misc.total', 'Total')}</span>
                                        <span>{fmt(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status history */}
                        {order.status_history &&
                            order.status_history.length > 0 && (
                                <div className="rounded-xl border border-border p-5">
                                    <h2 className="mb-4 font-semibold">
                                        {__(
                                            'misc.status_history',
                                            'Status History',
                                        )}
                                    </h2>
                                    <ol className="relative border-l border-border pl-4">
                                        {order.status_history.map((h) => (
                                            <li
                                                key={h.id}
                                                className="mb-4 ml-2 last:mb-0"
                                            >
                                                <div className="absolute -left-1.5 h-3 w-3 rounded-full border border-background bg-primary" />
                                                <p className="text-sm font-medium">
                                                    {statuses.find(
                                                        (s) =>
                                                            s.value ===
                                                            h.previous_status,
                                                    )?.label ??
                                                        h.previous_status}{' '}
                                                    →{' '}
                                                    {statuses.find(
                                                        (s) =>
                                                            s.value ===
                                                            h.new_status,
                                                    )?.label ?? h.new_status}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {fmtDate(h.changed_at)} ·{' '}
                                                    {h.changed_by}
                                                </p>
                                                {h.notes && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground italic">
                                                        {h.notes}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                    </div>

                    {/* ── Right (1/3): customer, addresses, shipment ── */}
                    <div className="space-y-4">
                        {/* Customer */}
                        <div className="rounded-xl border border-border p-5">
                            <h2 className="mb-3 text-sm font-semibold">
                                {__('misc.customer', 'Customer')}
                            </h2>
                            <p className="font-medium">{customerName}</p>
                            {customerEmail && (
                                <a
                                    href={`mailto:${customerEmail}`}
                                    className="text-sm text-primary hover:underline"
                                >
                                    {customerEmail}
                                </a>
                            )}
                        </div>

                        {/* Addresses */}
                        <div className="rounded-xl border border-border p-5">
                            <h2 className="mb-3 text-sm font-semibold">
                                {__('misc.addresses', 'Addresses')}
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="mb-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {__('misc.delivery', 'Delivery')}
                                    </p>
                                    <p>{fmtAddress(order.shipping_address)}</p>
                                </div>
                                <div>
                                    <p className="mb-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {__('misc.billing', 'Billing')}
                                    </p>
                                    <p>{fmtAddress(order.billing_address)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        {order.payment && (
                            <div className="rounded-xl border border-border p-5">
                                <h2 className="mb-3 text-sm font-semibold">
                                    {__('misc.payment', 'Payment')}
                                </h2>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {__('label.method', 'Method')}
                                        </span>
                                        <span className="font-medium capitalize">
                                            {order.payment.provider.replace(
                                                '_',
                                                ' ',
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {__('column.status', 'Status')}
                                        </span>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                                order.payment.status ===
                                                    'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : order.payment.status ===
                                                        'pending'
                                                      ? 'bg-yellow-100 text-yellow-800'
                                                      : 'bg-gray-100 text-gray-700',
                                            )}
                                        >
                                            {order.payment.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {__('label.amount', 'Amount')}
                                        </span>
                                        <span className="font-medium">
                                            {fmt(order.payment.amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipment */}
                        {order.shipment && (
                            <div className="rounded-xl border border-border p-5">
                                <h2 className="mb-3 text-sm font-semibold">
                                    {__('misc.shipment', 'Shipment')}
                                </h2>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {__('label.method', 'Method')}
                                        </span>
                                        <span className="font-medium">
                                            {order.shipment.shipping_method
                                                ?.name ??
                                                order.shipment.carrier}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {__('column.status', 'Status')}
                                        </span>
                                        <span className="font-medium capitalize">
                                            {order.shipment.status}
                                        </span>
                                    </div>
                                    {order.shipment.tracking_number && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {__(
                                                    'label.tracking_number',
                                                    'Tracking No.',
                                                )}
                                            </span>
                                            <span className="font-mono text-xs">
                                                {order.shipment.tracking_number}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                            <div className="rounded-xl border border-border p-5">
                                <h2 className="mb-2 text-sm font-semibold">
                                    {__('misc.notes', 'Notes')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {order.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
