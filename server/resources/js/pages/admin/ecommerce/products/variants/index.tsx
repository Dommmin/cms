import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';

type Variant = {
    id: number;
    sku: string;
    name: string;
    price: number;
    stock_quantity: number;
    is_active: boolean;
    is_default: boolean;
};

type Product = {
    id: number;
    name: string | Record<string, string>;
};

export default function ProductVariantsIndex({
    product,
    variants,
}: {
    product: Product;
    variants: Variant[];
}) {
    const productName = resolveLocalizedText(product.name);
    const __ = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/ecommerce/products' },
        {
            title: productName,
            href: `/admin/ecommerce/products/${product.id}/edit`,
        },
        {
            title: 'Variants',
            href: `/admin/ecommerce/products/${product.id}/variants`,
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
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={`/admin/ecommerce/products/${product.id}/edit`}
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
                                href={`/admin/ecommerce/products/${product.id}/variants/create`}
                                prefetch
                                cacheFor={30}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add_variant', 'Add Variant')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    {__('column.name', 'Name')}
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    {__('column.sku', 'SKU')}
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    {__('column.price', 'Price')}
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    {__('column.stock', 'Stock')}
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    {__('column.status', 'Status')}
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                    {__('column.actions', 'Actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {variants.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        {__(
                                            'empty.variants',
                                            'No variants yet.',
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                variants.map((variant) => (
                                    <tr key={variant.id} className="border-t">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {variant.name}
                                            </div>
                                            {variant.is_default && (
                                                <div className="text-xs text-muted-foreground">
                                                    {__(
                                                        'misc.default_variant',
                                                        'Default variant',
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono">
                                            {variant.sku}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Intl.NumberFormat('pl-PL', {
                                                style: 'currency',
                                                currency: 'PLN',
                                            }).format(variant.price / 100)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {variant.stock_quantity}
                                        </td>
                                        <td className="px-4 py-3">
                                            {variant.is_active
                                                ? __('status.active', 'Active')
                                                : __(
                                                      'status.inactive',
                                                      'Inactive',
                                                  )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={`/admin/ecommerce/products/${product.id}/variants/${variant.id}/edit`}
                                                        prefetch
                                                        cacheFor={30}
                                                    >
                                                        <PencilIcon className="mr-1 h-3 w-3" />
                                                        {__(
                                                            'action.edit',
                                                            'Edit',
                                                        )}
                                                    </Link>
                                                </Button>
                                                <ConfirmButton
                                                    variant="outline"
                                                    size="sm"
                                                    title={__(
                                                        'dialog.delete_title',
                                                        'Delete Variant',
                                                    )}
                                                    description={`${__('dialog.delete_variant_desc', 'Delete variant')} "${variant.name}"?`}
                                                    onConfirm={() => {
                                                        router.delete(
                                                            `/admin/ecommerce/products/${product.id}/variants/${variant.id}`,
                                                        );
                                                    }}
                                                >
                                                    <TrashIcon className="mr-1 h-3 w-3" />
                                                </ConfirmButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
