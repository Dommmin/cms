import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as ShippingMethodController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ShippingMethodController';
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
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, ShippingMethod } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Shipping Methods', href: ShippingMethodController.index.url() },
];

export default function ShippingMethodsIndex({
    methods,
    filters,
    carriers,
}: IndexProps) {
    const __ = useTranslation();
    const activeFilterCount = [filters.carrier, filters.is_active].filter(
        Boolean,
    ).length;

    const updateFilters = (
        nextFilters: Partial<
            Pick<IndexProps['filters'], 'carrier' | 'is_active'>
        >,
    ) => {
        router.get(
            ShippingMethodController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const columns: ColumnDef<ShippingMethod>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div className="font-medium">
                    {resolveLocalizedText(row.original.name)}
                </div>
            ),
        },
        {
            accessorKey: 'carrier',
            header: __('column.carrier', 'Carrier'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.carrier}
                </Badge>
            ),
        },
        {
            accessorKey: 'base_price',
            header: __('column.base_price', 'Base Price'),
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.base_price / 100} PLN
                </span>
            ),
        },
        {
            accessorKey: 'price_per_kg',
            header: __('column.per_kg', 'Per Kg'),
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.price_per_kg / 100} PLN
                </span>
            ),
        },
        {
            accessorKey: 'shipments_count',
            header: __('column.shipments', 'Shipments'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.shipments_count}</span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active
                        ? __('status.active', 'Active')
                        : __('status.inactive', 'Inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={ShippingMethodController.edit.url(
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
                            'Delete Shipping Method',
                        )}
                        description={__('dialog.delete_confirm', {
                            name: resolveLocalizedText(row.original.name),
                        })}
                        onConfirm={() => {
                            router.delete(
                                ShippingMethodController.destroy.url(
                                    row.original.id,
                                ),
                                {
                                    onSuccess: () =>
                                        toast.success(
                                            'Shipping method deleted',
                                        ),
                                },
                            );
                        }}
                        disabled={row.original.shipments_count > 0}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shipping Methods" />
            <Wrapper>
                <PageHeader
                    title={__('page.shipping_methods', 'Shipping Methods')}
                    description={__(
                        'page.shipping_methods_desc',
                        'Manage shipping methods',
                    )}
                >
                    <PageHeaderActions compact>
                        <Link href={ShippingMethodController.create.url()}>
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add_method', 'Add Method')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.shipping_methods_filters_desc',
                        'Filter shipping methods by carrier and activity state.',
                    )}
                    contentClassName="sm:grid sm:grid-cols-2 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="shipping-carrier-filter">
                            {__('column.carrier', 'Carrier')}
                        </Label>
                        <Select
                            value={filters.carrier || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    carrier: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="shipping-carrier-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__(
                                        'column.carrier',
                                        'Carrier',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {carriers.map((carrier) => (
                                    <SelectItem
                                        key={carrier.value}
                                        value={carrier.value}
                                    >
                                        {carrier.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shipping-status-filter">
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
                                id="shipping-status-filter"
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
                    columns={columns}
                    data={methods.data}
                    pagination={{
                        current_page: methods.current_page,
                        last_page: methods.last_page,
                        per_page: methods.per_page,
                        total: methods.total,
                        prev_page_url: methods.prev_page_url ?? null,
                        next_page_url: methods.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search methods..."
                    searchValue={filters.search ?? ''}
                    baseUrl={ShippingMethodController.index.url()}
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => resolveLocalizedText(row.name)}
                />
            </Wrapper>
        </AppLayout>
    );
}
