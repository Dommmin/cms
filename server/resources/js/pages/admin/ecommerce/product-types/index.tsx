import { Head, router } from '@inertiajs/react';
import { Box, PencilIcon, Plus, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ProductType {
    id: number;
    name: string;
    slug: string;
    has_variants: boolean;
    is_shippable: boolean;
    products_count: number;
}

interface PaginationData {
    data: ProductType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    types: PaginationData;
    filters: {
        search?: string;
        has_variants?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Types',
        href: '/admin/ecommerce/product-types',
    },
];

export default function ProductTypesIndex({ types, filters }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Types" />

            <Wrapper>
                <PageHeader
                    title="Product Types"
                    description={`${types.total} product types configured`}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit(
                                    '/admin/ecommerce/product-types/create',
                                )
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Type
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: 'Type',
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
                            header: 'Slug',
                            cell: ({ row }) => (
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    /{row.original.slug}
                                </code>
                            ),
                        },
                        {
                            accessorKey: 'products_count',
                            header: 'Products',
                        },
                        {
                            accessorKey: 'has_variants',
                            header: 'Variants',
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
                            header: 'Actions',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.visit(
                                                `/admin/ecommerce/product-types/${row.original.id}/edit`,
                                            )
                                        }
                                    >
                                        <PencilIcon className="mr-1 h-3 w-3" />
                                        Edit
                                    </Button>
                                    <ConfirmButton
                                        variant="destructive"
                                        size="sm"
                                        title="Delete Product Type"
                                        description={`Delete product type "${row.original.name}"?`}
                                        onConfirm={() => {
                                            router.delete(
                                                `/admin/ecommerce/product-types/${row.original.id}`,
                                                {
                                                    onSuccess: () =>
                                                        toast.success('Product type deleted'),
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
                    searchPlaceholder="Search types..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/product-types"
                />
            </Wrapper>
        </AppLayout>
    );
}
