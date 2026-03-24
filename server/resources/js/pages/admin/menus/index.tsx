import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, PencilIcon, TrashIcon, CopyIcon } from 'lucide-react';
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
import type { Menu, MenusData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menus', href: '/admin/menus' },
];

export default function MenusIndex({ menus, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Menu>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'location',
            header: __('column.location', 'Location'),
            cell: ({ row }) =>
                row.original.location ? (
                    <Badge variant="outline">{row.original.location}</Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'all_items_count',
            header: __('column.items', 'Items'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.all_items_count}</span>
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
                            href={`/admin/menus/${row.original.id}/edit`}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            router.post(
                                `/admin/menus/${row.original.id}/duplicate`,
                                {},
                                {
                                    onSuccess: () =>
                                        toast.success('Menu duplicated'),
                                },
                            );
                        }}
                    >
                        <CopyIcon className="mr-1 h-3 w-3" />
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Menu')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(`/admin/menus/${row.original.id}`, {
                                onSuccess: () => toast.success('Menu deleted'),
                            });
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menus" />
            <Wrapper>
                <PageHeader
                    title={__('page.menus', 'Menus')}
                    description={__(
                        'page.menus_desc',
                        'Manage navigation menus',
                    )}
                >
                    <PageHeaderActions>
                        <Link href="/admin/menus/create">
                            <Button variant="outline">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'Create Menu')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={menus.data}
                    pagination={{
                        current_page: menus.current_page,
                        last_page: menus.last_page,
                        per_page: menus.per_page,
                        total: menus.total,
                        prev_page_url: menus.prev_page_url ?? null,
                        next_page_url: menus.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search menus...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/menus"
                />
            </Wrapper>
        </AppLayout>
    );
}
