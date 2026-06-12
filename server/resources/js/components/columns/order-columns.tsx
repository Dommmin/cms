import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, MoreHorizontalIcon } from 'lucide-react';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type SelectionProps = {
    selectedIds?: number[];
    onToggleAll?: () => void;
    onToggleOne?: (id: number) => void;
    allSelected?: boolean;
};

export function useOrderColumns(
    selection?: SelectionProps,
): ColumnDef<OrderRow>[] {
    const __ = useTranslation();

    const checkboxColumn: ColumnDef<OrderRow> = {
        id: 'select',
        meta: {
            className: 'w-[40px]',
            mobileHidden: true,
        } as ColumnDef<OrderRow>['meta'],
        header: () => (
            <input
                type="checkbox"
                checked={selection?.allSelected ?? false}
                onChange={selection?.onToggleAll}
                className="h-4 w-4 rounded border-gray-300"
                aria-label="Select all orders"
            />
        ),
        cell: ({ row }) => (
            <input
                type="checkbox"
                checked={
                    selection?.selectedIds?.includes(row.original.id) ?? false
                }
                onChange={() => selection?.onToggleOne?.(row.original.id)}
                className="h-4 w-4 rounded border-gray-300"
                aria-label={`Select order ${row.original.order_number}`}
            />
        ),
    };

    const dataColumns: ColumnDef<OrderRow>[] = [
        {
            accessorKey: 'order_number',
            meta: { className: 'w-[120px]' },
            header: 'Order',
            cell: ({ row }) => (
                <span className="font-mono font-medium">
                    {row.original.order_number}
                </span>
            ),
        },
        {
            accessorKey: 'customer',
            // Customer column left auto-sized to span remaining table width
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
            meta: { className: 'w-[130px]' },
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
            meta: {
                className: 'w-[140px]',
                mobileHidden: true,
            },
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
            meta: { className: 'w-[120px]' },
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
            meta: {
                className: 'w-[140px]',
                mobileHidden: true,
            },
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
            meta: { className: 'w-[100px]' },
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            {__('column.actions', 'Actions')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                            <Link
                                href={OrderController.show.url(row.original.id)}
                                prefetch
                                cacheFor={60}
                                className="flex w-full items-center"
                            >
                                <EyeIcon className="h-4 w-4" />
                                View
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return selection ? [checkboxColumn, ...dataColumns] : dataColumns;
}

/** @deprecated Use useOrderColumns() hook instead */
export const orderColumns: ColumnDef<OrderRow>[] = [];
