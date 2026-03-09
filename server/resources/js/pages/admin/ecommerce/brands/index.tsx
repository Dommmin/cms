import { Head, router } from '@inertiajs/react';
import { Plus, Tag, PencilIcon, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    products_count: number;
}

interface PaginationData {
    data: Brand[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    brands: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Brands',
        href: '/admin/ecommerce/brands',
    },
];

export default function BrandsIndex({ brands, filters }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brands" />

            <Wrapper>
                <PageHeader
                    title="Brands"
                    description={`${brands.total} product brands`}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/ecommerce/brands/create')
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Brand
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: 'Brand',
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
                            accessorKey: 'is_active',
                            header: 'Status',
                            cell: ({ row }) => (
                                <Badge
                                    variant={
                                        row.original.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {row.original.is_active
                                        ? 'Active'
                                        : 'Inactive'}
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
                                                `/admin/ecommerce/brands/${row.original.id}/edit`,
                                            )
                                        }
                                    >
                                        <PencilIcon className="mr-1 h-3 w-3" />
                                        Edit
                                    </Button>
                                    <ConfirmButton
                                        variant="destructive"
                                        size="sm"
                                        title="Delete Brand"
                                        description={`Are you sure you want to delete "${row.original.name}"?`}
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
                    searchPlaceholder="Search brands..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/brands"
                />
            </Wrapper>
        </AppLayout>
    );
}
