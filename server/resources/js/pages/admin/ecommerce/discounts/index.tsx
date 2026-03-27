import { Head, Link } from '@inertiajs/react';
import * as DiscountController from '@/actions/App/Http/Controllers/Admin/Ecommerce/DiscountController';
import { Plus, Percent } from 'lucide-react';
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
        title: 'Discounts',
        href: DiscountController.index.url(),
    },
];

export default function DiscountsIndex({ discounts, filters }: IndexProps) {
    const __ = useTranslation();
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
                    title={__('page.discounts', 'Discounts')}
                    description={`${discounts.total} discount codes`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={DiscountController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Discount')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'code',
                            header: __('column.code', 'Code'),
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
                            header: __('column.name', 'Name'),
                        },
                        {
                            accessorKey: 'value',
                            header: __('column.value', 'Value'),
                            cell: ({ row }) =>
                                formatDiscount(
                                    row.original.type,
                                    row.original.value,
                                ),
                        },
                        {
                            accessorKey: 'uses_count',
                            header: __('column.uses', 'Uses'),
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
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search discounts...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={DiscountController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
