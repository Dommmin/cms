import { Head, Link, router } from '@inertiajs/react';
import { Percent, Plus } from 'lucide-react';
import * as DiscountController from '@/actions/App/Http/Controllers/Admin/Ecommerce/DiscountController';
import DataTable from '@/components/data-table';
import ListFilters from '@/components/list-filters';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    const activeFilterCount = [filters.type, filters.is_active].filter(
        Boolean,
    ).length;

    const updateFilters = (
        nextFilters: Partial<Pick<IndexProps['filters'], 'type' | 'is_active'>>,
    ) => {
        router.get(
            DiscountController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

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
                    <PageHeaderActions compact>
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

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.discounts_filters_desc',
                        'Filter discount codes by type and activity state.',
                    )}
                    contentClassName="sm:grid sm:grid-cols-2 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="discount-type-filter">
                            {__('column.type', 'Type')}
                        </Label>
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    type: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="discount-type-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.type', 'Type')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                <SelectItem value="percentage">
                                    {__(
                                        'discount.type.percentage',
                                        'Percentage',
                                    )}
                                </SelectItem>
                                <SelectItem value="fixed_amount">
                                    {__(
                                        'discount.type.fixed_amount',
                                        'Fixed amount',
                                    )}
                                </SelectItem>
                                <SelectItem value="free_shipping">
                                    {__(
                                        'discount.type.free_shipping',
                                        'Free shipping',
                                    )}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discount-status-filter">
                            {__('column.status', 'Status')}
                        </Label>
                        <Select
                            value={filters.is_active || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    is_active: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="discount-status-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.status', 'Status')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                <SelectItem value="1">
                                    {__('status.active', 'Active')}
                                </SelectItem>
                                <SelectItem value="0">
                                    {__('status.inactive', 'Inactive')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </ListFilters>

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
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => row.code}
                />
            </Wrapper>
        </AppLayout>
    );
}
