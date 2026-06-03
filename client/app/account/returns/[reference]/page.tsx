'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { getReturn } from '@/api/orders';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

const RETURN_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-green-100 text-green-800',
    received: 'bg-orange-100 text-orange-800',
    return_label_sent: 'bg-purple-100 text-purple-800',
    awaiting_return: 'bg-purple-50 text-purple-700',
    inspected: 'bg-gray-100 text-gray-800',
    closed: 'bg-gray-100 text-gray-600',
};

function formatLabel(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function AccountReturnDetailPage() {
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { formatPrice } = useCurrency();
    const params = useParams();

    const rawReference = params.reference;
    const reference = Array.isArray(rawReference)
        ? (rawReference[0] ?? '')
        : (rawReference ?? '');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['returns', 'detail', reference],
        queryFn: () => getReturn(reference),
        enabled: !!reference,
    });

    if (!reference) {
        return (
            <div className="border-border bg-card rounded-xl border p-8 text-center">
                <p className="font-medium">
                    {t(
                        'account.returns_invalid_reference',
                        'Invalid return reference.',
                    )}
                </p>
                <Link
                    href={lp('/account/returns')}
                    className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t('account.back_to_returns', 'Back to returns')}
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="bg-muted h-8 w-56 animate-pulse rounded" />
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="border-border bg-card h-64 animate-pulse rounded-xl border lg:col-span-2" />
                    <div className="border-border bg-card h-64 animate-pulse rounded-xl border" />
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="border-border bg-card rounded-xl border p-8 text-center">
                <Package
                    className="text-muted-foreground mx-auto mb-4 h-12 w-12"
                    aria-hidden="true"
                />
                <p className="font-medium">
                    {t(
                        'account.returns_not_found',
                        'Could not find this return.',
                    )}
                </p>
                <Link
                    href={lp('/account/returns')}
                    className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t('account.back_to_returns', 'Back to returns')}
                </Link>
            </div>
        );
    }

    const statusHistory = data.status_history ?? [];
    const hasOrderReference = !!data.order_reference_number;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <Link
                        href={lp('/account/returns')}
                        className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('account.back_to_returns', 'Back to returns')}
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {data.reference_number}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {formatDate(data.created_at)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {hasOrderReference && (
                        <Link
                            href={lp(
                                `/account/orders/${data.order_reference_number}`,
                            )}
                            className="border-input bg-background hover:bg-accent rounded-full border px-3 py-1.5 text-sm font-medium"
                        >
                            {t('account.view_order', 'View order')}
                        </Link>
                    )}
                    <span
                        className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
                            RETURN_STATUS_COLORS[data.status] ??
                            'bg-muted text-muted-foreground'
                        }`}
                    >
                        {formatLabel(data.status)}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section className="border-border bg-card rounded-xl border p-5">
                        <h2 className="font-semibold">
                            {t('account.return_details', 'Return details')}
                        </h2>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                                    {t('account.return_type', 'Type')}
                                </dt>
                                <dd className="mt-1 text-sm font-medium">
                                    {formatLabel(data.return_type)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                                    {t('account.return_reference', 'Reference')}
                                </dt>
                                <dd className="mt-1 text-sm font-medium">
                                    {data.reference_number}
                                </dd>
                            </div>
                            {data.order_reference_number && (
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                                        {t('account.order', 'Order')}
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium">
                                        <Link
                                            href={lp(
                                                `/account/orders/${data.order_reference_number}`,
                                            )}
                                            className="text-primary hover:underline"
                                        >
                                            #{data.order_reference_number}
                                        </Link>
                                    </dd>
                                </div>
                            )}
                            {data.return_tracking_number && (
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                                        {t(
                                            'account.return_tracking',
                                            'Tracking',
                                        )}
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium">
                                        {data.return_tracking_number}
                                    </dd>
                                </div>
                            )}
                            {data.refund_amount !== null && (
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                                        {t(
                                            'account.refund_amount',
                                            'Refund amount',
                                        )}
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-green-600">
                                        {formatPrice(data.refund_amount)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <section className="border-border bg-card rounded-xl border p-5">
                        <h2 className="font-semibold">
                            {t('account.return_items', 'Items')}
                        </h2>
                        {data.items.length === 0 ? (
                            <p className="text-muted-foreground mt-4 text-sm">
                                {t(
                                    'account.return_items_empty',
                                    'No items were attached to this case.',
                                )}
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {data.items.map((item, index) => (
                                    <li
                                        key={index}
                                        className="border-border bg-background rounded-lg border p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.product_name ??
                                                        t('order.item', 'Item')}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {t('order.qty', 'Qty')}:{' '}
                                                    {item.quantity}
                                                </p>
                                            </div>
                                            {item.condition && (
                                                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs capitalize">
                                                    {item.condition}
                                                </span>
                                            )}
                                        </div>
                                        {item.notes && (
                                            <p className="text-muted-foreground mt-2 text-sm">
                                                {item.notes}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="border-border bg-card rounded-xl border p-5">
                        <h2 className="font-semibold">
                            {t('account.return_notes', 'Notes')}
                        </h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                                    {t('account.customer_notes', 'Customer')}
                                </p>
                                <p className="mt-1 text-sm">
                                    {data.customer_notes ??
                                        t(
                                            'account.no_customer_notes',
                                            'No customer notes.',
                                        )}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                                    {t('account.admin_notes', 'Admin')}
                                </p>
                                <p className="mt-1 text-sm">
                                    {data.admin_notes ??
                                        t(
                                            'account.no_admin_notes',
                                            'No admin notes.',
                                        )}
                                </p>
                            </div>
                        </div>
                    </section>

                    {statusHistory.length > 0 && (
                        <section className="border-border bg-card rounded-xl border p-5">
                            <h2 className="font-semibold">
                                {t('account.status_history', 'Status history')}
                            </h2>
                            <ol className="mt-4 space-y-3">
                                {statusHistory.map((entry, index) => (
                                    <li
                                        key={`${entry.new_status}-${index}`}
                                        className="border-border bg-background rounded-lg border p-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-medium capitalize">
                                                {formatLabel(entry.new_status)}
                                            </span>
                                            {entry.changed_at && (
                                                <time
                                                    dateTime={entry.changed_at}
                                                    className="text-muted-foreground text-xs"
                                                >
                                                    {formatDate(
                                                        entry.changed_at,
                                                    )}
                                                </time>
                                            )}
                                        </div>
                                        {entry.notes && (
                                            <p className="text-muted-foreground mt-2 text-sm">
                                                {entry.notes}
                                            </p>
                                        )}
                                        {entry.changed_by && (
                                            <p className="text-muted-foreground mt-2 text-xs">
                                                {entry.changed_by}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}
                </div>

                <aside className="space-y-6">
                    <section className="border-border bg-card rounded-xl border p-5">
                        <h2 className="font-semibold">
                            {t('account.summary', 'Summary')}
                        </h2>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t('account.created_at', 'Created')}
                                </dt>
                                <dd className="text-right font-medium">
                                    {formatDate(data.created_at)}
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t('account.status', 'Status')}
                                </dt>
                                <dd className="text-right font-medium">
                                    {formatLabel(data.status)}
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t('account.type', 'Type')}
                                </dt>
                                <dd className="text-right font-medium">
                                    {formatLabel(data.return_type)}
                                </dd>
                            </div>
                            {data.order_reference_number && (
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-muted-foreground">
                                        {t('account.order', 'Order')}
                                    </dt>
                                    <dd className="text-right font-medium">
                                        <Link
                                            href={lp(
                                                `/account/orders/${data.order_reference_number}`,
                                            )}
                                            className="text-primary hover:underline"
                                        >
                                            #{data.order_reference_number}
                                        </Link>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <Link
                        href={lp('/account/returns')}
                        className="border-input bg-background hover:bg-accent flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('account.back_to_returns', 'Back to returns')}
                    </Link>
                </aside>
            </div>
        </div>
    );
}
