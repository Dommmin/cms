import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import * as ProductVariantController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductVariantController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                                    <select
                                        id="tax_rate_id"
                                        name="tax_rate_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        defaultValue=""
                                    >
                                        <option value="">Default</option>
                                        {taxRates.map((rate) => (
                                            <option
                                                key={rate.id}
                                                value={rate.id}
                                            >
                                                {rate.name} ({rate.rate}%)
                                            </option>
                                        ))}
                                    </select>
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
                                                <select
                                                    id={`attribute-${attribute.id}`}
                                                    name="attribute_values[]"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                    defaultValue=""
                                                    required={
                                                        attribute.is_required
                                                    }
                                                >
                                                    <option value="">
                                                        {__(
                                                            'placeholder.select_value',
                                                            'Select value',
                                                        )}
                                                    </option>
                                                    {attribute.values.map(
                                                        (value) => (
                                                            <option
                                                                key={value.id}
                                                                value={value.id}
                                                            >
                                                                {value.value}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <InputError
                                        message={errors.attribute_values}
                                    />
                                </div>
                            )}

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
