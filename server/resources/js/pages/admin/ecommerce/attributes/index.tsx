import { Head, Link, router } from '@inertiajs/react';
import { Plus, List, PencilIcon, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: string;
    is_filterable: boolean;
    is_variant_selection: boolean;
    values_count: number;
}

interface PaginationData {
    data: Attribute[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    attributes: PaginationData;
    filters: {
        search?: string;
        type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attributes',
        href: '/admin/ecommerce/attributes',
    },
];

export default function AttributesIndex({ attributes, filters }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attributes" />

            <Wrapper>
                <PageHeader
                    title="Attributes"
                    description={`${attributes.total} product attributes`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/ecommerce/attributes/create" prefetch cacheFor={30}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Attribute
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: 'Attribute',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100">
                                        <List className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {row.original.name}
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            /{row.original.slug}
                                        </p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'type',
                            header: 'Type',
                            cell: ({ row }) => (
                                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs">
                                    {row.original.type}
                                </span>
                            ),
                        },
                        {
                            accessorKey: 'values_count',
                            header: 'Values',
                        },
                        {
                            accessorKey: 'is_filterable',
                            header: 'Usage',
                            cell: ({ row }) => (
                                <div className="flex gap-1">
                                    {row.original.is_filterable && (
                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                            Filter
                                        </span>
                                    )}
                                    {row.original.is_variant_selection && (
                                        <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                                            Variant
                                        </span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: 'actions',
                            header: 'Actions',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/ecommerce/attributes/${row.original.id}/edit`} prefetch cacheFor={30}>
                                            <PencilIcon className="mr-1 h-3 w-3" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <ConfirmButton
                                        variant="outline"
                                        size="sm"
                                        title="Delete Attribute"
                                        description={`Are you sure you want to delete "${row.original.name}"?`}
                                        onConfirm={() => {
                                            router.delete(
                                                `/admin/ecommerce/attributes/${row.original.id}`,
                                            );
                                        }}
                                    >
                                        <TrashIcon className="mr-1 h-3 w-3" />
                                    </ConfirmButton>
                                </div>
                            ),
                        },
                    ]}
                    data={attributes.data}
                    pagination={{
                        current_page: attributes.current_page,
                        last_page: attributes.last_page,
                        per_page: attributes.per_page,
                        total: attributes.total,
                        prev_page_url: attributes.prev_page_url ?? null,
                        next_page_url: attributes.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search attributes..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/attributes"
                />
            </Wrapper>
        </AppLayout>
    );
}
