import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Menu as MenuIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CopyIcon,
    EyeIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Menu = {
    id: number;
    name: string;
    location: string | null;
    is_active: boolean;
    all_items_count: number;
    created_at: string;
};

type MenusData = {
    data: Menu[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    menus: MenusData;
    filters: { search?: string; location?: string; is_active?: string };
    locations: { value: string; label: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menus', href: '/admin/menus' },
];

export default function MenusIndex({ menus, filters, locations }: Props) {
    const columns: ColumnDef<Menu>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'location',
            header: 'Location',
            cell: ({ row }) =>
                row.original.location ? (
                    <Badge variant="outline">{row.original.location}</Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'all_items_count',
            header: 'Items',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.all_items_count}</span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
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
                        <Link href={`/admin/menus/${row.original.id}/edit`} prefetch cacheFor={30}>
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
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
                        variant="destructive"
                        size="sm"
                        title="Delete Menu"
                        description={`Are you sure you want to delete "${row.original.name}"? All menu items will be deleted.`}
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
                <PageHeader title="Menus" description="Manage navigation menus">
                    <PageHeaderActions>
                        <Link href="/admin/menus/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Menu
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
                    searchPlaceholder="Search menus..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/menus"
                />
            </Wrapper>
        </AppLayout>
    );
}
