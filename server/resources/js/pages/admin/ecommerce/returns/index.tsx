import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import * as ReturnRequestController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ReturnRequestController';
import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, ReturnRequest } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Returns', href: ReturnRequestController.index.url() },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
};

export default function ReturnsIndex({ returns, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<ReturnRequest>[] = [
        {
            accessorKey: 'reference_number',
            header: __('column.id', 'Reference'),
            cell: ({ row }) => (
                <span className="font-mono font-medium">
                    {row.original.reference_number}
                </span>
            ),
        },
        {
            accessorKey: 'order',
            header: __('column.orders', 'Order'),
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.order.order_number}
                </span>
            ),
        },
        {
            id: 'customer',
            header: __('column.customer', 'Customer'),
            cell: ({ row }) => {
                const customer = row.original.order.customer;
                if (!customer)
                    return (
                        <span className="text-muted-foreground">
                            {__('misc.guest', 'Guest')}
                        </span>
                    );
                return (
                    <div>
                        <p className="font-medium">
                            {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {customer.email}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'return_type',
            header: __('column.type', 'Type'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.return_type}
                </Badge>
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
            accessorKey: 'created_at',
            header: __('column.created_at', 'Requested'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.created_at).toLocaleDateString()}
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
                            href={ReturnRequestController.show.url(
                                row.original.id,
                            )}
                            prefetch
                            cacheFor={60}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            {__('action.show', 'View')}
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Returns" />
            <Wrapper>
                <PageHeader
                    title={__('page.returns', 'Returns')}
                    description={__(
                        'page.returns_desc',
                        'Manage return requests',
                    )}
                />

                <DataTable
                    columns={columns}
                    data={returns.data}
                    pagination={{
                        current_page: returns.current_page,
                        last_page: returns.last_page,
                        per_page: returns.per_page,
                        total: returns.total,
                        prev_page_url: returns.prev_page_url ?? null,
                        next_page_url: returns.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search returns...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={ReturnRequestController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
