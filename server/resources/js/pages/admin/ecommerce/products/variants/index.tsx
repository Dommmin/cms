import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeftIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import * as ProductVariantController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductVariantController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import type { Product, Variant } from './index.types';

export default function ProductVariantsIndex({
    product,
    variants,
}: {
    product: Product;
    variants: Variant[];
}) {
    const productName = resolveLocalizedText(product.name);
    const __ = useTranslation();
    const columns: ColumnDef<Variant>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">
                        {resolveLocalizedText(row.original.name)}
                    </div>
                    {row.original.is_default && (
                        <div className="text-xs text-muted-foreground">
                            {__('misc.default_variant', 'Default variant')}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'sku',
            header: __('column.sku', 'SKU'),
            cell: ({ row }) => (
                <span className="font-mono">{row.original.sku}</span>
            ),
        },
        {
            accessorKey: 'price',
            header: __('column.price', 'Price'),
            cell: ({ row }) => (
                <span>
                    {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                    }).format(row.original.price / 100)}
                </span>
            ),
        },
        {
            accessorKey: 'stock_quantity',
            header: __('column.stock', 'Stock'),
        },
        {
            accessorKey: 'stock_status',
            header: 'Stock Status',
            cell: ({ row }) => {
                if (row.original.stock_status === 'in_stock') {
                    return (
                        <Badge className="border-green-200 bg-green-100 text-green-800">
                            In Stock
                        </Badge>
                    );
                }

                if (row.original.stock_status === 'backorder') {
                    return (
                        <Badge className="border-blue-200 bg-blue-100 text-blue-800">
                            Backorder
                        </Badge>
                    );
                }

                if (row.original.stock_status === 'pre_order') {
                    return (
                        <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
                            Pre-Order
                        </Badge>
                    );
                }

                return (
                    <Badge className="border-red-200 bg-red-100 text-red-800">
                        Out of Stock
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) =>
                row.original.is_active
                    ? __('status.active', 'Active')
                    : __('status.inactive', 'Inactive'),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={ProductVariantController.edit.url([
                                product.id,
                                row.original.id,
                            ])}
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
                        title={__('dialog.delete_title', 'Delete Variant')}
                        description={`${__('dialog.delete_variant_desc', 'Delete variant')} "${resolveLocalizedText(row.original.name)}"?`}
                        onConfirm={() => {
                            router.delete(
                                ProductVariantController.destroy.url([
                                    product.id,
                                    row.original.id,
                                ]),
                            );
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: ProductController.index.url() },
        {
            title: productName,
            href: ProductController.edit.url(product.id),
        },
        {
            title: 'Variants',
            href: ProductVariantController.index.url(product.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${__('misc.variants', 'Variants')}: ${productName}`}
            />
            <Wrapper>
                <PageHeader
                    title={`${__('misc.variants', 'Variants')}: ${productName}`}
                    description={__(
                        'page.variants_desc',
                        'Manage product variants, stock and pricing',
                    )}
                >
                    <PageHeaderActions compact>
                        <Button asChild variant="outline">
                            <Link
                                href={ProductController.edit.url(product.id)}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__(
                                    'action.back_to_product',
                                    'Back to Product',
                                )}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={ProductVariantController.create.url(
                                    product.id,
                                )}
                                prefetch
                                cacheFor={30}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add_variant', 'Add Variant')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    data={variants}
                    columns={columns}
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => (
                        <div className="min-w-0">
                            <div className="font-medium">
                                {resolveLocalizedText(row.name)}
                            </div>
                            {row.is_default && (
                                <p className="text-xs text-muted-foreground">
                                    {__(
                                        'misc.default_variant',
                                        'Default variant',
                                    )}
                                </p>
                            )}
                        </div>
                    )}
                    mobileEmptyLabel={__('empty.variants', 'No variants yet.')}
                />
            </Wrapper>
        </AppLayout>
    );
}
