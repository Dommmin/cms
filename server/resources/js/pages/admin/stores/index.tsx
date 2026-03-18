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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Store = {
    id: number;
    name: string;
    slug: string;
    address: string;
    city: string;
    country: string;
    lat: string;
    lng: string;
    is_active: boolean;
    created_at: string;
};

type StoresData = {
    data: Store[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    stores: StoresData;
    filters: { search?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stores', href: '/admin/stores' },
];

export default function StoresIndex({ stores, filters }: Props) {
    const columns: ColumnDef<Store>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-muted-foreground text-xs">
                        {row.original.slug}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'address',
            header: 'Location',
            cell: ({ row }) => (
                <div>
                    <p className="text-sm">{row.original.address}</p>
                    <p className="text-muted-foreground text-xs">
                        {row.original.city}, {row.original.country}
                    </p>
                </div>
            ),
        },
        {
            id: 'coordinates',
            header: 'Coordinates',
            cell: ({ row }) => (
                <span className="font-mono text-xs">
                    {row.original.lat}, {row.original.lng}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
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
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/stores/${row.original.id}/edit`} prefetch cacheFor={30}>
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Store"
                        description="Are you sure you want to delete this store? This action cannot be undone."
                        onConfirm={() => {
                            router.delete(`/admin/stores/${row.original.id}`, {
                                onSuccess: () => toast.success('Store deleted'),
                            });
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        Delete
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
                    title="Stores"
                    description="Manage physical store locations"
                >
                    <PageHeaderActions>
                        <Link href="/admin/stores/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Store
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                {stores.data.length === 0 && !filters.search ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <MapPin className="text-muted-foreground mb-4 h-12 w-12" />
                        <h3 className="text-lg font-semibold">
                            No stores yet
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Add your first store location to get started.
                        </p>
                        <Link href="/admin/stores/create" className="mt-4">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Store
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
                        searchPlaceholder="Search stores..."
                        searchValue={filters.search ?? ''}
                        baseUrl="/admin/stores"
                    />
                )}
            </Wrapper>
        </AppLayout>
    );
}
