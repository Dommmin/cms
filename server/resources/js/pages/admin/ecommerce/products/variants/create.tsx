import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import * as ProductVariantController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductVariantController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { Product, TaxRate, VariantAttribute } from './create.types';

export default function CreateVariant({
    product,
    taxRates,
    attributes,
}: {
    product: Product;
    taxRates: TaxRate[];
    attributes: VariantAttribute[];
}) {
    const __ = useTranslation();
    const formId = 'product-variant-create-form';
    const productName = resolveLocalizedText(product.name);
    const [stockStatus, setStockStatus] = useState('in_stock');
    const [taxRateId, setTaxRateId] = useState('');
    const [selectedAttributes, setSelectedAttributes] = useState<Record<number, string>>({});

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
        {
            title: 'Create',
            href: ProductVariantController.create.url(product.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Variant: ${productName}`} />
            <Wrapper>
                <PageHeader
                    title={`Create Variant: ${productName}`}
                    description={__(
                        'page.create_variant_desc',
                        'Add a new product variant',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ProductVariantController.index.url(
                                    product.id,
                                )}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Variants
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={ProductVariantController.store.url(product.id)}
                    method="post"
                    id={formId}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <div className="space-y-6 rounded-xl border bg-card p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {__('label.name', 'Name')} *
                                    </Label>
                                    <Input id="name" name="name" required />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">
                                        {__('label.sku', 'SKU')} *
                                    </Label>
                                    <Input id="sku" name="sku" required />
                                    <InputError message={errors.sku} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">
                                        {__('label.price_pln', 'Price (PLN)')} *
                                    </Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                    <InputError message={errors.price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cost_price">
                                        {__(
                                            'label.cost_price_pln',
                                            'Cost Price (PLN)',
                                        )}
                                    </Label>
                                    <Input
                                        id="cost_price"
                                        name="cost_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                    />
                                    <InputError message={errors.cost_price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="compare_at_price">
                                        {__(
                                            'label.compare_at_pln',
                                            'Compare At (PLN)',
                                        )}
                                    </Label>
                                    <Input
                                        id="compare_at_price"
                                        name="compare_at_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                    />
                                    <InputError
                                        message={errors.compare_at_price}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stock_quantity">
                                        {__(
                                            'label.stock_quantity',
                                            'Stock Quantity',
                                        )}{' '}
                                        *
                                    </Label>
                                    <Input
                                        id="stock_quantity"
                                        name="stock_quantity"
                                        type="number"
                                        min="0"
                                        required
                                        defaultValue={0}
                                    />
                                    <InputError
                                        message={errors.stock_quantity}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock_threshold">
                                        {__(
                                            'label.low_stock_threshold',
                                            'Low Stock Threshold',
                                        )}
                                    </Label>
                                    <Input
                                        id="stock_threshold"
                                        name="stock_threshold"
                                        type="number"
                                        min="0"
                                        defaultValue={5}
                                    />
                                    <InputError
                                        message={errors.stock_threshold}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="weight">
                                        {__('label.weight_kg', 'Weight (kg)')}
                                    </Label>
                                    <Input
                                        id="weight"
                                        name="weight"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                    />
                                    <InputError message={errors.weight} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tax_rate_id">
                                        {__('label.tax_rate', 'Tax Rate')}
                                    </Label>
                                    <Select value={taxRateId || 'default'} onValueChange={(v) => setTaxRateId(v === 'default' ? '' : v)}>
                                        <SelectTrigger id="tax_rate_id">
                                            <SelectValue placeholder="Default" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            {taxRates.map((rate) => (
                                                <SelectItem
                                                    key={rate.id}
                                                    value={rate.id.toString()}
                                                >
                                                    {rate.name} ({rate.rate}%)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" name="tax_rate_id" value={taxRateId} />
                                    <InputError message={errors.tax_rate_id} />
                                </div>
                            </div>

                            {attributes.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold">
                                        {__(
                                            'misc.variant_attributes',
                                            'Variant Attributes',
                                        )}
                                    </h3>
                                    <input
                                        type="hidden"
                                        name="attribute_values[]"
                                        value=""
                                    />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {attributes.map((attribute) => (
                                            <div
                                                key={attribute.id}
                                                className="grid gap-2"
                                            >
                                                <Label
                                                    htmlFor={`attribute-${attribute.id}`}
                                                >
                                                    {attribute.name}
                                                    {attribute.is_required
                                                        ? ' *'
                                                        : ''}
                                                </Label>
                                                <Select
                                                    value={selectedAttributes[attribute.id] || 'none'}
                                                    onValueChange={(v) =>
                                                        setSelectedAttributes((prev) => ({
                                                            ...prev,
                                                            [attribute.id]: v === 'none' ? '' : v,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger id={`attribute-${attribute.id}`}>
                                                        <SelectValue placeholder={__('placeholder.select_value', 'Select value')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            {__('placeholder.select_value', 'Select value')}
                                                        </SelectItem>
                                                        {attribute.values.map((value) => (
                                                            <SelectItem
                                                                key={value.id}
                                                                value={value.id.toString()}
                                                            >
                                                                {value.value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input
                                                    type="hidden"
                                                    name="attribute_values[]"
                                                    value={selectedAttributes[attribute.id] || ''}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <InputError
                                        message={errors.attribute_values}
                                    />
                                </div>
                            )}

                            <div className="space-y-4 rounded-xl border p-4">
                                <h3 className="text-sm font-semibold">
                                    Stock Availability
                                </h3>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Allow Backorders</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Customers can order even when out of
                                            stock
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="hidden"
                                            name="backorder_allowed"
                                            value="0"
                                        />
                                        <input
                                            type="checkbox"
                                            name="backorder_allowed"
                                            value="1"
                                            className="h-4 w-4 rounded border-input"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="stock_status">
                                        Stock Status Override
                                    </Label>
                                    <Select value={stockStatus} onValueChange={setStockStatus}>
                                        <SelectTrigger id="stock_status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in_stock">In Stock</SelectItem>
                                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                            <SelectItem value="backorder">Backorder</SelectItem>
                                            <SelectItem value="pre_order">Pre-Order</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" name="stock_status" value={stockStatus} />
                                    <InputError message={errors.stock_status} />
                                </div>

                                {stockStatus === 'pre_order' && (
                                    <div className="space-y-1">
                                        <Label htmlFor="available_at">
                                            Available From
                                        </Label>
                                        <Input
                                            id="available_at"
                                            name="available_at"
                                            type="datetime-local"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            When will this product be available
                                            for shipping?
                                        </p>
                                        <InputError
                                            message={errors.available_at}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="is_active"
                                        value="0"
                                    />
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        value="1"
                                        defaultChecked
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <span className="text-sm">
                                        {__('label.active', 'Active')}
                                    </span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="is_default"
                                        value="0"
                                    />
                                    <input
                                        type="checkbox"
                                        name="is_default"
                                        value="1"
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <span className="text-sm">
                                        {__(
                                            'label.set_as_default',
                                            'Set as default',
                                        )}
                                    </span>
                                </label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={__(
                                    'action.create_variant',
                                    'Create Variant',
                                )}
                            />
                        </div>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
