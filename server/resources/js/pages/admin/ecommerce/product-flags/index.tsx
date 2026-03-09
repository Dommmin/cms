import { Head, router } from '@inertiajs/react';
import { Flag, PencilIcon, Plus, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ProductFlag {
    id: number;
    name: string;
    slug: string;
    color: string;
    description: string | null;
    is_active: boolean;
    position: number;
}

interface PaginationData {
    data: ProductFlag[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    flags: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Flags', href: '/admin/ecommerce/product-flags' },
];

export default function ProductFlagsIndex({ flags, filters }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Flags" />

            <Wrapper>
                <PageHeader
                    title="Product Flags"
                    description={`${flags.total} product flags`}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/ecommerce/product-flags/create')
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Flag
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: 'Flag',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded"
                                        style={{ backgroundColor: `${row.original.color}20` }}
                                    >
                                        <Flag
                                            className="h-4 w-4"
                                            style={{ color: row.original.color }}
                                        />
                                    </div>
                                    <div>
                                        <span className="font-medium">{row.original.name}</span>
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
                            header: 'Slug',
                            cell: ({ row }) => (
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    {row.original.slug}
                                </code>
                            ),
                        },
                        {
                            accessorKey: 'color',
                            header: 'Color',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="inline-block h-4 w-4 rounded-sm border"
                                        style={{ backgroundColor: row.original.color }}
                                    />
                                    <code className="text-xs text-muted-foreground">
                                        {row.original.color}
                                    </code>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'is_active',
                            header: 'Status',
                            cell: ({ row }) => (
                                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                                    {row.original.is_active ? 'Active' : 'Inactive'}
                                </Badge>
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
                                                `/admin/ecommerce/product-flags/${row.original.id}/edit`,
                                            )
                                        }
                                    >
                                        <PencilIcon className="mr-1 h-3 w-3" />
                                        Edit
                                    </Button>
                                    <ConfirmButton
                                        variant="destructive"
                                        size="sm"
                                        title="Delete Flag"
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
                    searchPlaceholder="Search flags..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/product-flags"
                />
            </Wrapper>
        </AppLayout>
    );
}
