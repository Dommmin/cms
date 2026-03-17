import { Head, Link, router } from '@inertiajs/react';
import { Plus, Percent, PencilIcon, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Discount {
    id: number;
    code: string;
    name: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    is_active: boolean;
    uses_count: number;
    max_uses?: number;
}

interface PaginationData {
    data: Discount[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    discounts: PaginationData;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Discounts',
        href: '/admin/ecommerce/discounts',
    },
];

export default function DiscountsIndex({ discounts, filters }: IndexProps) {
    const formatDiscount = (type: string, value: number) => {
        if (type === 'percentage') return `${value}%`;
        if (type === 'fixed_amount') return `$${(value / 100).toFixed(2)}`;
        return 'Free Shipping';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Discounts" />

            <Wrapper>
                <PageHeader
                    title="Discounts"
                    description={`${discounts.total} discount codes`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/ecommerce/discounts/create" prefetch cacheFor={30}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Discount
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'code',
                            header: 'Code',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-yellow-100">
                                        <Percent className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <span className="font-mono font-medium">
                                        {row.original.code}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'name',
                            header: 'Name',
                        },
                        {
                            accessorKey: 'value',
                            header: 'Value',
                            cell: ({ row }) =>
                                formatDiscount(
                                    row.original.type,
                                    row.original.value,
                                ),
                        },
                        {
                            accessorKey: 'uses_count',
                            header: 'Uses',
                            cell: ({ row }) => (
                                <span>
                                    {row.original.uses_count}
                                    {row.original.max_uses &&
                                        ` / ${row.original.max_uses}`}
                                </span>
                            ),
                        },
                        {
                            accessorKey: 'is_active',
                            header: 'Status',
                            cell: ({ row }) =>
                                row.original.is_active ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        Inactive
                                    </span>
                                ),
                        },
                    ]}
                    data={discounts.data}
                    pagination={{
                        current_page: discounts.current_page,
                        last_page: discounts.last_page,
                        per_page: discounts.per_page,
                        total: discounts.total,
                        prev_page_url: discounts.prev_page_url ?? null,
                        next_page_url: discounts.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search discounts..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/discounts"
                />
            </Wrapper>
        </AppLayout>
    );
}
