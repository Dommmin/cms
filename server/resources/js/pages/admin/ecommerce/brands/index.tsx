import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, Plus, Tag, TrashIcon } from 'lucide-react';
import * as BrandController from '@/actions/App/Http/Controllers/Admin/Ecommerce/BrandController';
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
        title: 'Brands',
        href: BrandController.index.url(),
    },
];

export default function BrandsIndex({ brands, filters }: IndexProps) {
    const __ = useTranslation();
    const activeFilterCount = [filters.is_active].filter(Boolean).length;

    const updateFilters = (
        nextFilters: Partial<Pick<IndexProps['filters'], 'is_active'>>,
    ) => {
        router.get(
            BrandController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brands" />

            <Wrapper>
                <PageHeader
                    title={__('page.brands', 'Brands')}
                    description={`${brands.total} product brands`}
                >
                    <PageHeaderActions compact>
                        <Button asChild variant="outline">
                            <Link
                                href={BrandController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add_brand', 'Add Brand')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.brands_filters_desc',
                        'Filter brands by active status.',
                    )}
                    contentClassName="sm:max-w-xs"
                >
                    <div className="space-y-2">
                        <Label htmlFor="brand-status-filter">
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
                                id="brand-status-filter"
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
                            accessorKey: 'name',
                            header: __('column.brand', 'Brand'),
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
                            header: __('column.slug', 'Slug'),
                            cell: ({ row }) => (
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    /{row.original.slug}
                                </code>
                            ),
                        },
                        {
                            accessorKey: 'products_count',
                            header: __('column.products', 'Products'),
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
                            id: 'actions',
                            header: __('column.actions', 'Actions'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={BrandController.edit.url(
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
                                            'Delete Brand',
                                        )}
                                        description={__(
                                            'dialog.delete_confirm',
                                            { name: row.original.name },
                                        )}
                                        onConfirm={() => {
                                            router.delete(
                                                BrandController.destroy.url(
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
                    searchPlaceholder={__(
                        'placeholder.search_brands',
                        'Search brands...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={BrandController.index.url()}
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => row.name}
                />
            </Wrapper>
        </AppLayout>
    );
}
