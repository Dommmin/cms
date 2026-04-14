import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    EditIcon,
    MapPinIcon,
    ShoppingBagIcon,
    UserCircleIcon,
} from 'lucide-react';
import * as CustomerController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CustomerController';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { Address, CustomerShow, OrderSummary } from './show.types';

const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    awaiting_payment: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
};

function fmt(cents: number): string {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    }).format(cents / 100);
}

function fmtDate(d: string): string {
    return new Date(d).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
    );
}

function OrderRow({ order }: { order: OrderSummary }) {
    const color =
        ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700';
    return (
        <tr className="border-b border-border last:border-0">
            <td className="px-4 py-3 font-mono text-sm">
                #{order.reference_number}
            </td>
            <td className="px-4 py-3">
                <span
                    className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        color,
                    )}
                >
                    {order.status}
                </span>
            </td>
            <td className="px-4 py-3 text-right text-sm font-medium">
                {fmt(order.total)}
            </td>
            <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                {fmtDate(order.created_at)}
            </td>
        </tr>
    );
}

function AddressCard({ address }: { address: Address }) {
    return (
        <div className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">
                {address.first_name} {address.last_name}
                {address.is_default && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Default
                    </span>
                )}
            </p>
            <p className="text-muted-foreground">{address.street}</p>
            <p className="text-muted-foreground">
                {address.postal_code} {address.city}, {address.country}
            </p>
        </div>
    );
}

export default function CustomerShowPage({
    customer,
}: {
    customer: CustomerShow;
}) {
    const __ = useTranslation();

    const fullName = `${customer.first_name} ${customer.last_name}`.trim();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('page.customers', 'Customers'),
            href: CustomerController.index.url(),
        },
        {
            title: fullName || customer.email,
            href: CustomerController.show.url(customer.id),
        },
    ];

    const { data, setData, patch, processing } = useForm({
        notes: customer.notes ?? '',
    });

    function saveNotes(e: React.FormEvent) {
        e.preventDefault();
        patch(CustomerController.update.url(customer.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={fullName || customer.email} />

            <Wrapper>
                <PageHeader
                    title={fullName || customer.email}
                    description={customer.email}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={CustomerController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={CustomerController.edit.url(customer.id)}
                            >
                                <EditIcon className="mr-2 h-4 w-4" />
                                {__('action.edit', 'Edit')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                {/* Header info bar */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <UserCircleIcon className="h-4 w-4" />
                    {customer.phone && <span>{customer.phone}</span>}
                    {customer.company_name && (
                        <span>{customer.company_name}</span>
                    )}
                    {customer.tax_id && <span>NIP: {customer.tax_id}</span>}
                    <span
                        className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-semibold',
                            customer.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800',
                        )}
                    >
                        {customer.is_active
                            ? __('label.active', 'Active')
                            : __('label.inactive', 'Inactive')}
                    </span>
                </div>

                <div className="mt-6 space-y-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard
                            label={__('column.total_orders', 'Total Orders')}
                            value={String(customer.total_orders)}
                        />
                        <StatCard
                            label={__('column.total_spent', 'Total Spent')}
                            value={fmt(customer.total_spent)}
                        />
                        <StatCard
                            label={__('column.avg_order', 'Avg. Order Value')}
                            value={fmt(customer.avg_order_value)}
                        />
                        <StatCard
                            label={__('column.last_order', 'Last Order')}
                            value={
                                customer.last_order_at
                                    ? fmtDate(customer.last_order_at)
                                    : '—'
                            }
                        />
                    </div>

                    {/* LTV section */}
                    <div className="rounded-xl border border-border p-5">
                        <h2 className="mb-4 font-semibold">
                            {__(
                                'misc.lifetime_value',
                                'Lifetime Value (delivered orders)',
                            )}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {__('misc.ltv_30', 'Last 30 days')}
                                </p>
                                <p className="mt-0.5 text-lg font-semibold">
                                    {fmt(customer.ltv_30_days)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {__('misc.ltv_90', 'Last 90 days')}
                                </p>
                                <p className="mt-0.5 text-lg font-semibold">
                                    {fmt(customer.ltv_90_days)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {__('misc.ltv_all', 'All time')}
                                </p>
                                <p className="mt-0.5 text-lg font-semibold">
                                    {fmt(customer.total_spent)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left: orders + notes */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Recent orders */}
                            <div className="rounded-xl border border-border">
                                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                                    <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
                                    <h2 className="font-semibold">
                                        {__(
                                            'misc.recent_orders',
                                            'Recent Orders',
                                        )}
                                    </h2>
                                </div>
                                {customer.orders.length === 0 ? (
                                    <p className="px-5 py-4 text-sm text-muted-foreground">
                                        {__('misc.no_orders', 'No orders yet.')}
                                    </p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/40 text-xs text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left font-medium">
                                                    {__(
                                                        'column.reference',
                                                        'Reference',
                                                    )}
                                                </th>
                                                <th className="px-4 py-2.5 text-left font-medium">
                                                    {__(
                                                        'column.status',
                                                        'Status',
                                                    )}
                                                </th>
                                                <th className="px-4 py-2.5 text-right font-medium">
                                                    {__(
                                                        'column.total',
                                                        'Total',
                                                    )}
                                                </th>
                                                <th className="px-4 py-2.5 text-right font-medium">
                                                    {__('column.date', 'Date')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customer.orders.map((order) => (
                                                <OrderRow
                                                    key={order.id}
                                                    order={order}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Admin notes */}
                            <div className="rounded-xl border border-border p-5">
                                <h2 className="mb-3 font-semibold">
                                    {__('misc.admin_notes', 'Admin Notes')}
                                </h2>
                                <form
                                    onSubmit={saveNotes}
                                    className="space-y-3"
                                >
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        rows={4}
                                        maxLength={5000}
                                        placeholder={__(
                                            'placeholder.notes',
                                            'Internal notes about this customer...',
                                        )}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            size="sm"
                                        >
                                            {processing
                                                ? __('misc.saving', 'Saving...')
                                                : __(
                                                      'action.save',
                                                      'Save Notes',
                                                  )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right: addresses */}
                        <div>
                            <div className="rounded-xl border border-border p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                                    <h2 className="font-semibold">
                                        {__('misc.addresses', 'Addresses')}
                                    </h2>
                                </div>
                                {customer.addresses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'misc.no_addresses',
                                            'No addresses saved.',
                                        )}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {customer.addresses.map((address) => (
                                            <AddressCard
                                                key={address.id}
                                                address={address}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
