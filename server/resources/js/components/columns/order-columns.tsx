import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type { OrderRow } from './order-columns.types';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
};

export function useOrderColumns(): ColumnDef<OrderRow>[] {
    const __ = useTranslation();

    return [
        {
            accessorKey: 'order_number',
            header: 'Order',
            cell: ({ row }) => (
                <span className="font-mono font-medium">
                    {row.original.order_number}
                </span>
            ),
        },
        {
            accessorKey: 'customer',
            header: __('column.customer', 'Customer'),
            cell: ({ row }) =>
                row.original.customer ? (
                    <div>
                        <div className="font-medium">
                            {row.original.customer.first_name}{' '}
                            {row.original.customer.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {row.original.customer.email}
                        </div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">
                        {__('misc.guest', 'Guest')}
                    </span>
                ),
        },
        {
            accessorKey: 'status',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    className={
                        statusColors[row.original.status] ||
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'payment_status',
            header: 'Payment',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={
                        paymentStatusColors[row.original.payment_status] ||
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {row.original.payment_status}
                </Badge>
            ),
        },
        {
            accessorKey: 'total',
            header: __('column.total_spent', 'Total'),
            cell: ({ row }) => (
                <span className="font-mono font-medium">
                    {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                    }).format(row.original.total / 100)}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: __('column.created_at', 'Date'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.created_at).toLocaleDateString(
                        'pl-PL',
                        {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        },
                    )}
                </span>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={OrderController.show.url(row.original.id)}
                            prefetch
                            cacheFor={60}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];
}

/** @deprecated Use useOrderColumns() hook instead */
export const orderColumns: ColumnDef<OrderRow>[] = [];
