import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/use-translation';
import { ConfirmButton } from '@/components/confirm-dialog';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { formatDateTime } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Order {
    id: number;
    order_number: string;
    customer: Customer | null;
}

interface ProductVariant {
    id: number;
    sku: string;
    name: string;
    product: { id: number; name: string } | null;
}

interface ReturnItem {
    id: number;
    quantity: number;
    condition: string | null;
    notes: string | null;
    order_item_id: number;
    product_variant: ProductVariant | null;
}

interface StatusHistoryEntry {
    id: number;
    previous_status: string;
    new_status: string;
    changed_by: string;
    notes: string | null;
    changed_at: string;
}

interface ReturnRequest {
    id: number;
    reference_number: string;
    status: string;
    return_type: string;
    reason: string | null;
    customer_notes: string | null;
    admin_notes: string | null;
    return_tracking_number: string | null;
    refund_amount: number | null;
    created_at: string;
    order: Order;
    items: ReturnItem[];
    status_history: StatusHistoryEntry[];
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    return_label_sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    awaiting_return:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    received: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    inspected: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    refunded: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};


export default function Show({ return: returnRequest }: { return: ReturnRequest }) {
    const __ = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Returns', href: '/admin/ecommerce/returns' },
        { title: returnRequest.reference_number, href: '' },
    ];

    const canApprove = returnRequest.status === 'pending';
    const canReject = ['pending', 'approved'].includes(returnRequest.status);
    const canProcessRefund = ['received', 'inspected'].includes(returnRequest.status);

    const handleApprove = () => {
        router.post(
            `/admin/ecommerce/returns/${returnRequest.id}/approve`,
            {},
            { onSuccess: () => toast.success('Return approved') },
        );
    };

    const handleReject = () => {
        router.post(
            `/admin/ecommerce/returns/${returnRequest.id}/reject`,
            {},
            { onSuccess: () => toast.success('Return rejected') },
        );
    };

    const handleProcessRefund = () => {
        router.post(
            `/admin/ecommerce/returns/${returnRequest.id}/process-refund`,
            {},
            { onSuccess: () => toast.success('Refund processed') },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Return ${returnRequest.reference_number}`} />

            <Wrapper>
                <PageHeader
                    title={returnRequest.reference_number}
                    description={`Return request • ${formatDateTime(returnRequest.created_at)}`}
                >
                    <PageHeaderActions>
                        {canApprove && (
                            <ConfirmButton
                                variant="outline"
                                title={__('dialog.approve_return', 'Approve Return')}
                                description={__('dialog.approve_return_desc', 'Are you sure you want to approve this return request?')}
                                onConfirm={handleApprove}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {__('action.approve', 'Approve')}
                            </ConfirmButton>
                        )}
                        {canReject && (
                            <ConfirmButton
                                variant="outline"
                                title={__('dialog.reject_return', 'Reject Return')}
                                description={__('dialog.reject_return_desc', 'Are you sure you want to reject this return request?')}
                                onConfirm={handleReject}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                {__('action.reject', 'Reject')}
                            </ConfirmButton>
                        )}
                        {canProcessRefund && (
                            <ConfirmButton
                                variant="outline"
                                title={__('dialog.process_refund', 'Process Refund')}
                                description={__('dialog.process_refund_desc', 'Are you sure you want to process the refund for this return?')}
                                onConfirm={handleProcessRefund}
                            >
                                {__('action.process_refund', 'Process Refund')}
                            </ConfirmButton>
                        )}
                        <Button asChild variant="outline">
                            <Link href="/admin/ecommerce/returns" prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Return items */}
                        <div className="rounded-xl border bg-card">
                            <div className="border-b px-6 py-4">
                                <h2 className="font-semibold">{__('misc.return_items', 'Return Items')}</h2>
                            </div>
                            {returnRequest.items.length === 0 ? (
                                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No items attached to this return.
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            <th className="px-6 py-3">Product</th>
                                            <th className="px-6 py-3">SKU</th>
                                            <th className="px-6 py-3">Qty</th>
                                            <th className="px-6 py-3">Condition</th>
                                            <th className="px-6 py-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {returnRequest.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-3 font-medium">
                                                    {item.product_variant?.product?.name ?? '—'}
                                                </td>
                                                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                                                    {item.product_variant?.sku ?? '—'}
                                                </td>
                                                <td className="px-6 py-3">{item.quantity}</td>
                                                <td className="px-6 py-3">
                                                    {item.condition ? (
                                                        <Badge variant="outline" className="text-xs">
                                                            {item.condition}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-muted-foreground">
                                                    {item.notes ?? '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-4 rounded-xl border bg-card p-6">
                            <h2 className="font-semibold">{__('misc.notes', 'Notes')}</h2>

                            <div className="grid gap-1.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Reason
                                </p>
                                <p className="text-sm">
                                    {returnRequest.reason || (
                                        <span className="text-muted-foreground">Not provided</span>
                                    )}
                                </p>
                            </div>

                            <div className="grid gap-1.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Customer Notes
                                </p>
                                <p className="text-sm">
                                    {returnRequest.customer_notes || (
                                        <span className="text-muted-foreground">None</span>
                                    )}
                                </p>
                            </div>

                            <div className="grid gap-1.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Admin Notes
                                </p>
                                <p className="text-sm">
                                    {returnRequest.admin_notes || (
                                        <span className="text-muted-foreground">None</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Status timeline */}
                        <div className="rounded-xl border bg-card p-6">
                            <h2 className="mb-4 font-semibold">{__('misc.status_history', 'Status History')}</h2>
                            {returnRequest.status_history.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No history yet.</p>
                            ) : (
                                <ol className="relative border-l border-border">
                                    {returnRequest.status_history.map((entry) => (
                                        <li key={entry.id} className="mb-6 ml-4 last:mb-0">
                                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background bg-muted-foreground" />
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={
                                                        statusColors[entry.new_status] ||
                                                        'bg-gray-100 text-gray-800'
                                                    }
                                                >
                                                    {entry.new_status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(entry.changed_at)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    by {entry.changed_by}
                                                </span>
                                            </div>
                                            {entry.notes && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {entry.notes}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Status
                            </h3>
                            <Badge
                                className={
                                    statusColors[returnRequest.status] ||
                                    'bg-gray-100 text-gray-800'
                                }
                            >
                                {returnRequest.status}
                            </Badge>
                        </div>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Details
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs text-muted-foreground">Reference</dt>
                                    <dd className="mt-0.5 font-mono font-medium">
                                        {returnRequest.reference_number}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Type</dt>
                                    <dd className="mt-0.5">
                                        <Badge variant="outline" className="text-xs">
                                            {returnRequest.return_type}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Order</dt>
                                    <dd className="mt-0.5">
                                        <Link
                                            href={`/admin/ecommerce/orders/${returnRequest.order.id}`}
                                            prefetch
                                            cacheFor={60}
                                            className="font-mono text-primary hover:underline"
                                        >
                                            {returnRequest.order.order_number}
                                        </Link>
                                    </dd>
                                </div>
                                {returnRequest.refund_amount !== null && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground">Refund Amount</dt>
                                        <dd className="mt-0.5 font-medium text-green-600 dark:text-green-400">
                                            {new Intl.NumberFormat('pl-PL', {
                                                style: 'currency',
                                                currency: 'PLN',
                                            }).format(returnRequest.refund_amount / 100)}
                                        </dd>
                                    </div>
                                )}
                                {returnRequest.return_tracking_number && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground">
                                            Tracking Number
                                        </dt>
                                        <dd className="mt-0.5 font-mono text-xs">
                                            {returnRequest.return_tracking_number}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Customer
                            </h3>
                            {returnRequest.order.customer ? (
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-xs text-muted-foreground">Name</dt>
                                        <dd className="mt-0.5 font-medium">
                                            {returnRequest.order.customer.first_name}{' '}
                                            {returnRequest.order.customer.last_name}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground">Email</dt>
                                        <dd className="mt-0.5 text-primary">
                                            {returnRequest.order.customer.email}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-muted-foreground">{__('misc.guest_order', 'Guest order')}</p>
                            )}
                        </div>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Timeline
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Created {formatDateTime(returnRequest.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
