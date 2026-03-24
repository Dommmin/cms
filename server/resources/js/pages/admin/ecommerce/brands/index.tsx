import { Head, Link, router } from '@inertiajs/react';
import { Plus, Tag, PencilIcon, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Brand, PaginationData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Brands',
        href: '/admin/ecommerce/brands',
    },
];

export default function BrandsIndex({ brands, filters }: IndexProps) {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brands" />

            <Wrapper>
                <PageHeader
                    title={__('page.brands', 'Brands')}
                    description={`${brands.total} product brands`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/ecommerce/brands/create"
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add_brand', 'Add Brand')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: __('column.brand', 'Brand'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-100">
                                        <Tag className="h-4 w-4 text-purple-600" />
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
                                    /{row.original.slug}
                                </code>
                            ),
                        },
                        {
                            accessorKey: 'products_count',
                            header: __('column.products', 'Products'),
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
                                            href={`/admin/ecommerce/brands/${row.original.id}/edit`}
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
                                            'Delete Brand',
                                        )}
                                        description={`${__('dialog.are_you_sure', 'Are you sure you want to delete')} "${row.original.name}"?`}
                                        onConfirm={() => {
                                            router.delete(
                                                `/admin/ecommerce/brands/${row.original.id}`,
                                            );
                                        }}
                                    >
                                        <TrashIcon className="mr-1 h-3 w-3" />
                                    </ConfirmButton>
                                </div>
                            ),
                        },
                    ]}
                    data={brands.data}
                    pagination={{
                        current_page: brands.current_page,
                        last_page: brands.last_page,
                        per_page: brands.per_page,
                        total: brands.total,
                        prev_page_url: brands.prev_page_url ?? null,
                        next_page_url: brands.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_brands',
                        'Search brands...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/brands"
                />
            </Wrapper>
        </AppLayout>
    );
}
