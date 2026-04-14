import { Head, Link, router } from '@inertiajs/react';
import { Plus, RefreshCw, Users } from 'lucide-react';
import * as CustomerSegmentController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CustomerSegmentController';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer Segments',
        href: CustomerSegmentController.index.url(),
    },
];

export default function CustomerSegmentsIndex({ segments }: IndexProps) {
    const __ = useTranslation();

    function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this segment?')) return;
        router.delete(CustomerSegmentController.destroy.url(id));
    }

    function handleSync(id: number) {
        router.post(CustomerSegmentController.sync.url(id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Segments" />

            <Wrapper>
                <PageHeader
                    title="Customer Segments"
                    description={`${segments.total} segments`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={CustomerSegmentController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                New Segment
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: __('column.name', 'Name'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {row.original.name}
                                        </div>
                                        {row.original.description && (
                                            <div className="max-w-xs truncate text-xs text-muted-foreground">
                                                {row.original.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'type',
                            header: __('column.type', 'Type'),
                            cell: ({ row }) =>
                                row.original.type === 'dynamic' ? (
                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                                        Dynamic
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        Manual
                                    </span>
                                ),
                        },
                        {
                            accessorKey: 'customers_count',
                            header: 'Customers',
                            cell: ({ row }) => (
                                <span className="font-mono">
                                    {row.original.customers_count}
                                </span>
                            ),
                        },
                        {
                            accessorKey: 'is_active',
                            header: __('column.status', 'Status'),
                            cell: ({ row }) =>
                                row.original.is_active ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                        {__('status.active', 'Active')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        {__('status.inactive', 'Inactive')}
                                    </span>
                                ),
                        },
                        {
                            accessorKey: 'created_at',
                            header: __('column.created_at', 'Created'),
                            cell: ({ row }) =>
                                new Date(
                                    row.original.created_at,
                                ).toLocaleDateString(),
                        },
                        {
                            id: 'actions',
                            header: __('column.actions', 'Actions'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button asChild size="sm" variant="outline">
                                        <Link
                                            href={CustomerSegmentController.edit.url(
                                                row.original.id,
                                            )}
                                        >
                                            {__('action.edit', 'Edit')}
                                        </Link>
                                    </Button>
                                    {row.original.type === 'dynamic' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleSync(row.original.id)
                                            }
                                        >
                                            <RefreshCw className="mr-1 h-3 w-3" />
                                            Sync
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            handleDelete(row.original.id)
                                        }
                                    >
                                        {__('action.delete', 'Delete')}
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={segments.data}
                    pagination={{
                        current_page: segments.current_page,
                        last_page: segments.last_page,
                        per_page: segments.per_page,
                        total: segments.total,
                        prev_page_url: segments.prev_page_url ?? null,
                        next_page_url: segments.next_page_url ?? null,
                    }}
                />
            </Wrapper>
        </AppLayout>
    );
}
