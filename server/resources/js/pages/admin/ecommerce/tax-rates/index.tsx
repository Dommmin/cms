import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, Plus, Receipt, Star, TrashIcon } from 'lucide-react';
import * as TaxRateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/TaxRateController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import ListFilters from '@/components/list-filters';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
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
        title: 'Tax Rates',
        href: TaxRateController.index.url(),
    },
];

export default function TaxRatesIndex({ taxRates, filters }: IndexProps) {
    const __ = useTranslation();
    const activeFilterCount = [filters.is_active, filters.is_default].filter(
        Boolean,
    ).length;

    const updateFilters = (
        nextFilters: Partial<
            Pick<IndexProps['filters'], 'is_active' | 'is_default'>
        >,
    ) => {
        router.get(
            TaxRateController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tax Rates" />

            <Wrapper>
                <PageHeader
                    title={__('page.tax_rates', 'Tax Rates')}
                    description={`${taxRates.total} tax rates configured`}
                >
                    <PageHeaderActions compact>
                        <Button asChild variant="outline">
                            <Link
                                href={TaxRateController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add_rate', 'Add Rate')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.tax_rates_filters_desc',
                        'Filter tax rates by active and default status.',
                    )}
                    contentClassName="sm:grid sm:grid-cols-2 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="tax-rate-status-filter">
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
                                id="tax-rate-status-filter"
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
                    <div className="space-y-2">
                        <Label htmlFor="tax-rate-default-filter">
                            {__('column.default', 'Default')}
                        </Label>
                        <Select
                            value={filters.is_default || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    is_default: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="tax-rate-default-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__(
                                        'column.default',
                                        'Default',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                <SelectItem value="1">
                                    {__('status.yes', 'Yes')}
                                </SelectItem>
                                <SelectItem value="0">
                                    {__('status.no', 'No')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </ListFilters>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: __('column.name', 'Name'),
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
                            header: __('column.rate', 'Rate'),
                            cell: ({ row }) => (
                                <span className="text-lg font-semibold">
                                    {row.original.rate}%
                                </span>
                            ),
                        },
                        {
                            accessorKey: 'country_code',
                            header: __('column.country', 'Country'),
                            cell: ({ row }) => row.original.country_code || '-',
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
                            accessorKey: 'is_default',
                            header: __('column.default', 'Default'),
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
                            header: __('column.actions', 'Actions'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={TaxRateController.edit.url(
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
                                            'Delete Tax Rate',
                                        )}
                                        description={__(
                                            'dialog.delete_confirm',
                                            { name: row.original.name },
                                        )}
                                        onConfirm={() => {
                                            router.delete(
                                                TaxRateController.destroy.url(
                                                    row.original.id,
                                                ),
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
                    searchPlaceholder={__(
                        'placeholder.search_tax_rates',
                        'Search tax rates...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={TaxRateController.index.url()}
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => row.name}
                />
            </Wrapper>
        </AppLayout>
    );
}
