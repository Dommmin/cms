import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Product = {
    id: number;
    name: string;
};

type TaxRate = {
    id: number;
    name: string;
    rate: number;
};

type VariantAttribute = {
    id: number;
    name: string;
    slug: string;
    is_required: boolean;
    values: Array<{ id: number; value: string; slug: string }>;
};

export default function CreateVariant({
    product,
    taxRates,
    attributes,
}: {
    product: Product;
    taxRates: TaxRate[];
    attributes: VariantAttribute[];
}) {
    const formId = 'product-variant-create-form';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/ecommerce/products' },
        { title: product.name, href: `/admin/ecommerce/products/${product.id}/edit` },
        { title: 'Variants', href: `/admin/ecommerce/products/${product.id}/variants` },
        { title: 'Create', href: `/admin/ecommerce/products/${product.id}/variants/create` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Variant: ${product.name}`} />
            <Wrapper>
                <PageHeader
                    title={`Create Variant: ${product.name}`}
                    description="Add a new product variant"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit(`/admin/ecommerce/products/${product.id}/variants`)
                            }
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Variants
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={`/admin/ecommerce/products/${product.id}/variants`}
                    method="post"
                    id={formId}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <div className="space-y-6 rounded-xl border bg-card p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input id="name" name="name" required />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">SKU *</Label>
                                    <Input id="sku" name="sku" required />
                                    <InputError message={errors.sku} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price (PLN) *</Label>
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
                                        Cost Price (PLN)
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
                                        Compare At (PLN)
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
                                        Stock Quantity *
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
                                        Low Stock Threshold
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
                                    <Label htmlFor="weight">Weight (kg)</Label>
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
                                    <Label htmlFor="tax_rate_id">Tax Rate</Label>
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
                                        Variant Attributes
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
                                                        Select value
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
                                    <span className="text-sm">Active</span>
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
                                        Set as default
                                    </span>
                                </label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel="Create Variant"
                            />
                        </div>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
