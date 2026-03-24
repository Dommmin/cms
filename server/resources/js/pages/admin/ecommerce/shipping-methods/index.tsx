import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ShippingMethod, MethodsData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Shipping Methods', href: '/admin/ecommerce/shipping-methods' },
];

export default function ShippingMethodsIndex({ methods, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<ShippingMethod>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'carrier',
            header: __('column.carrier', 'Carrier'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.carrier}
                </Badge>
            ),
        },
        {
            accessorKey: 'base_price',
            header: __('column.base_price', 'Base Price'),
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.base_price / 100} PLN
                </span>
            ),
        },
        {
            accessorKey: 'price_per_kg',
            header: __('column.per_kg', 'Per Kg'),
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.price_per_kg / 100} PLN
                </span>
            ),
        },
        {
            accessorKey: 'shipments_count',
            header: __('column.shipments', 'Shipments'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.shipments_count}</span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active
                        ? __('status.active', 'Active')
                        : __('status.inactive', 'Inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/admin/ecommerce/shipping-methods/${row.original.id}/edit`}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__(
                            'dialog.delete_title',
                            'Delete Shipping Method',
                        )}
                        description={`Are you sure you want to delete "${row.original.name}"?`}
                        onConfirm={() => {
                            router.delete(
                                `/admin/ecommerce/shipping-methods/${row.original.id}`,
                                {
                                    onSuccess: () =>
                                        toast.success(
                                            'Shipping method deleted',
                                        ),
                                },
                            );
                        }}
                        disabled={row.original.shipments_count > 0}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shipping Methods" />
            <Wrapper>
                <PageHeader
                    title={__('page.shipping_methods', 'Shipping Methods')}
                    description={__(
                        'page.shipping_methods_desc',
                        'Manage shipping methods',
                    )}
                >
                    <PageHeaderActions>
                        <Link href="/admin/ecommerce/shipping-methods/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add_method', 'Add Method')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={methods.data}
                    pagination={{
                        current_page: methods.current_page,
                        last_page: methods.last_page,
                        per_page: methods.per_page,
                        total: methods.total,
                        prev_page_url: methods.prev_page_url ?? null,
                        next_page_url: methods.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search methods..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/shipping-methods"
                />
            </Wrapper>
        </AppLayout>
    );
}
