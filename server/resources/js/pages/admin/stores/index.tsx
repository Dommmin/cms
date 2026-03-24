import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MapPin, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
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
import type { Store, StoresData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stores', href: '/admin/stores' },
];

export default function StoresIndex({ stores, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Store>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.slug}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'address',
            header: __('column.location', 'Location'),
            cell: ({ row }) => (
                <div>
                    <p className="text-sm">{row.original.address}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.city}, {row.original.country}
                    </p>
                </div>
            ),
        },
        {
            id: 'coordinates',
            header: __('column.coordinates', 'Coordinates'),
            cell: ({ row }) => (
                <span className="font-mono text-xs">
                    {row.original.lat}, {row.original.lng}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => {
                        router.post(
                            `/admin/stores/${row.original.id}/toggle-active`,
                            {},
                            {
                                onSuccess: () =>
                                    toast.success('Status updated'),
                            },
                        );
                    }}
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
                            href={`/admin/stores/${row.original.id}/edit`}
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
                        title={__('dialog.delete_title', 'Delete Store')}
                        description={__(
                            'dialog.cannot_be_undone',
                            'Are you sure you want to delete this store? This action cannot be undone.',
                        )}
                        onConfirm={() => {
                            router.delete(`/admin/stores/${row.original.id}`, {
                                onSuccess: () => toast.success('Store deleted'),
                            });
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        {__('action.delete', 'Delete')}
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stores" />
            <Wrapper>
                <PageHeader
                    title={__('page.stores', 'Stores')}
                    description={__(
                        'page.stores_desc',
                        'Manage physical store locations',
                    )}
                >
                    <PageHeaderActions>
                        <Link href="/admin/stores/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Store')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                {stores.data.length === 0 && !filters.search ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                            {__('empty.no_stores', 'No stores yet')}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {__(
                                'empty.no_stores_desc',
                                'Add your first store location to get started.',
                            )}
                        </p>
                        <Link href="/admin/stores/create" className="mt-4">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Store')}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={stores.data}
                        pagination={{
                            current_page: stores.current_page,
                            last_page: stores.last_page,
                            per_page: stores.per_page,
                            total: stores.total,
                            prev_page_url: stores.prev_page_url ?? null,
                            next_page_url: stores.next_page_url ?? null,
                        }}
                        searchable
                        searchPlaceholder={__(
                            'placeholder.search',
                            'Search stores...',
                        )}
                        searchValue={filters.search ?? ''}
                        baseUrl="/admin/stores"
                    />
                )}
            </Wrapper>
        </AppLayout>
    );
}
