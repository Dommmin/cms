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
import type { IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: '/admin/newsletter' },
    { title: 'Segments', href: '/admin/newsletter/segments' },
];

export default function SegmentsIndex({ segments, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Segment>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'description',
            header: __('column.description', 'Description'),
            cell: ({ row }) =>
                row.original.description ? (
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                        {row.original.description}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'campaigns_count',
            header: __('column.campaigns', 'Campaigns'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.campaigns_count}</span>
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
                            href={`/admin/newsletter/segments/${row.original.id}/edit`}
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
                        title={__('dialog.delete_title', 'Delete Segment')}
                        description={`Are you sure you want to delete "${row.original.name}"?`}
                        onConfirm={() => {
                            router.delete(
                                `/admin/newsletter/segments/${row.original.id}`,
                                {
                                    onSuccess: () =>
                                        toast.success('Segment deleted'),
                                },
                            );
                        }}
                        disabled={row.original.campaigns_count > 0}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Newsletter Segments" />
            <Wrapper>
                <PageHeader
                    title={__('page.segments', 'Segments')}
                    description={__(
                        'page.segments_desc',
                        'Manage subscriber segments',
                    )}
                >
                    <PageHeaderActions>
                        <Link href="/admin/newsletter/segments/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'Create Segment')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={segments.data}
                    pagination={{
                        current_page: segments.current_page,
                        last_page: segments.last_page,
                        per_page: segments.per_page,
                        total: segments.total,
                        prev_page_url: segments.prev_page_url ?? null,
                        next_page_url: segments.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search segments...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/newsletter/segments"
                />
            </Wrapper>
        </AppLayout>
    );
}
