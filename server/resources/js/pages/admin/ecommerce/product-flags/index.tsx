import { Head, Link, router } from '@inertiajs/react';
import { Flag, PencilIcon, Plus, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ProductFlag, PaginationData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Flags', href: '/admin/ecommerce/product-flags' },
];

export default function ProductFlagsIndex({ flags, filters }: IndexProps) {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Flags" />

            <Wrapper>
                <PageHeader
                    title={__('page.product_flags', 'Product Flags')}
                    description={`${flags.total} product flags`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/ecommerce/product-flags/create"
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add_flag', 'Add Flag')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: __('column.flag', 'Flag'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded"
                                        style={{
                                            backgroundColor: `${row.original.color}20`,
                                        }}
                                    >
                                        <Flag
                                            className="h-4 w-4"
                                            style={{
                                                color: row.original.color,
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {row.original.name}
                                        </span>
                                        {row.original.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {row.original.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'slug',
                            header: __('column.slug', 'Slug'),
                            cell: ({ row }) => (
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    {row.original.slug}
                                </code>
                            ),
                        },
                        {
                            accessorKey: 'color',
                            header: __('column.color', 'Color'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="inline-block h-4 w-4 rounded-sm border"
                                        style={{
                                            backgroundColor: row.original.color,
                                        }}
                                    />
                                    <code className="text-xs text-muted-foreground">
                                        {row.original.color}
                                    </code>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'is_active',
                            header: __('column.status', 'Status'),
                            cell: ({ row }) => (
                                <Badge
                                    variant={
                                        row.original.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
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
                                            href={`/admin/ecommerce/product-flags/${row.original.id}/edit`}
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
                                            'Delete Flag',
                                        )}
                                        description={`Are you sure you want to delete "${row.original.name}"?`}
                                        onConfirm={() => {
                                            router.delete(
                                                `/admin/ecommerce/product-flags/${row.original.id}`,
                                            );
                                        }}
                                    >
                                        <TrashIcon className="mr-1 h-3 w-3" />
                                    </ConfirmButton>
                                </div>
                            ),
                        },
                    ]}
                    data={flags.data}
                    pagination={{
                        current_page: flags.current_page,
                        last_page: flags.last_page,
                        per_page: flags.per_page,
                        total: flags.total,
                        prev_page_url: flags.prev_page_url ?? null,
                        next_page_url: flags.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_flags',
                        'Search flags...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/product-flags"
                />
            </Wrapper>
        </AppLayout>
    );
}
