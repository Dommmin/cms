import { Head, Link, router } from '@inertiajs/react';
import { Plus, Receipt, Star, PencilIcon, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface TaxRate {
    id: number;
    name: string;
    rate: number;
    country_code?: string;
    is_active: boolean;
    is_default: boolean;
}

interface PaginationData {
    data: TaxRate[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    taxRates: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tax Rates',
        href: '/admin/ecommerce/tax-rates',
    },
];

export default function TaxRatesIndex({ taxRates, filters }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tax Rates" />

            <Wrapper>
                <PageHeader
                    title="Tax Rates"
                    description={`${taxRates.total} tax rates configured`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/ecommerce/tax-rates/create" prefetch cacheFor={30}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Rate
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: 'Name',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100">
                                        <Receipt className="h-4 w-4 text-red-600" />
                                    </div>
                                    <span className="font-medium">
                                        {row.original.name}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'rate',
                            header: 'Rate',
                            cell: ({ row }) => (
                                <span className="text-lg font-semibold">
                                    {row.original.rate}%
                                </span>
                            ),
                        },
                        {
                            accessorKey: 'country_code',
                            header: 'Country',
                            cell: ({ row }) => row.original.country_code || '-',
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
                            accessorKey: 'is_default',
                            header: 'Default',
                            cell: ({ row }) =>
                                row.original.is_default ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                                        <Star className="h-3 w-3" />
                                        Default
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-400">
                                        -
                                    </span>
                                ),
                        },
                        {
                            id: 'actions',
                            header: 'Actions',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/ecommerce/tax-rates/${row.original.id}/edit`} prefetch cacheFor={30}>
                                            <PencilIcon className="mr-1 h-3 w-3" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <ConfirmButton
                                        variant="outline"
                                        size="sm"
                                        title="Delete Tax Rate"
                                        description={`Are you sure you want to delete "${row.original.name}"?`}
                                        onConfirm={() => {
                                            router.delete(
                                                `/admin/ecommerce/tax-rates/${row.original.id}`,
                                            );
                                        }}
                                    >
                                        <TrashIcon className="mr-1 h-3 w-3" />
                                    </ConfirmButton>
                                </div>
                            ),
                        },
                    ]}
                    data={taxRates.data}
                    pagination={{
                        current_page: taxRates.current_page,
                        last_page: taxRates.last_page,
                        per_page: taxRates.per_page,
                        total: taxRates.total,
                        prev_page_url: taxRates.prev_page_url ?? null,
                        next_page_url: taxRates.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search tax rates..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/tax-rates"
                />
            </Wrapper>
        </AppLayout>
    );
}
