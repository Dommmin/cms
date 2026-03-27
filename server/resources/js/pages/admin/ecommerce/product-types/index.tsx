import { Head, Link, router } from '@inertiajs/react';
import { Box, PencilIcon, Plus, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as ProductTypeController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductTypeController';
import { ConfirmButton } from '@/components/confirm-dialog';
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
        title: 'Product Types',
        href: ProductTypeController.index.url(),
    },
];

export default function ProductTypesIndex({ types, filters }: IndexProps) {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Types" />

            <Wrapper>
                <PageHeader
                    title={__('page.product_types', 'Product Types')}
                    description={`${types.total} product types configured`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ProductTypeController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add_type', 'Add Type')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: __('column.type', 'Type'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-100">
                                        <Box className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <span className="font-medium">
                                        {row.original.name}
                                    </span>
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
                            accessorKey: 'has_variants',
                            header: __('column.variants', 'Variants'),
                            cell: ({ row }) =>
                                row.original.has_variants ? (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                        Yes
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        No
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
                                            href={ProductTypeController.edit.url(
                                                row.original.id,
                                            )}
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
                                            'Delete Product Type',
                                        )}
                                        description={`Delete product type "${row.original.name}"?`}
                                        onConfirm={() => {
                                            router.delete(
                                                ProductTypeController.destroy.url(
                                                    row.original.id,
                                                ),
                                                {
                                                    onSuccess: () =>
                                                        toast.success(
                                                            'Product type deleted',
                                                        ),
                                                },
                                            );
                                        }}
                                        disabled={
                                            row.original.products_count > 0
                                        }
                                    >
                                        <TrashIcon className="mr-1 h-3 w-3" />
                                    </ConfirmButton>
                                </div>
                            ),
                        },
                    ]}
                    data={types.data}
                    pagination={{
                        current_page: types.current_page,
                        last_page: types.last_page,
                        per_page: types.per_page,
                        total: types.total,
                        prev_page_url: types.prev_page_url ?? null,
                        next_page_url: types.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_types',
                        'Search types...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={ProductTypeController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
