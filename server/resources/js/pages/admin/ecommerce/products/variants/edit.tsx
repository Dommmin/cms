import { Form, Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
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
import type {
    PriceTier,
    Product,
    TaxRate,
    Variant,
    VariantAttribute,
} from './edit.types';

export default function EditVariant({
    product,
    variant,
    taxRates,
    attributes,
}: {
    product: Product;
    variant: Variant;
    taxRates: TaxRate[];
    attributes: VariantAttribute[];
}) {
    const __ = useTranslation();
    const formId = 'product-variant-edit-form';

    const initialTiers: PriceTier[] = (variant.price_tiers ?? []).map((t) => ({
        id: t.id,
        min_quantity: t.min_quantity,
        max_quantity: t.max_quantity,
        price: t.price / 100,
    }));

    const {
        data,
        setData,
        post,
        processing: tierProcessing,
        errors: tierErrors,
    } = useForm<{
        tiers: Array<{
            min_quantity: number | '';
            max_quantity: number | null | '';
            price: number | '';
        }>;
    }>({
        tiers:
            initialTiers.length > 0
                ? initialTiers.map((t) => ({
                      min_quantity: t.min_quantity,
                      max_quantity: t.max_quantity,
                      price: t.price,
                  }))
                : [],
    });

    function addTier(): void {
        setData('tiers', [
            ...data.tiers,
            { min_quantity: '', max_quantity: null, price: '' },
        ]);
    }

    function removeTier(index: number): void {
        setData(
            'tiers',
            data.tiers.filter((_, i) => i !== index),
        );
    }

    function updateTier(
        index: number,
        field: 'min_quantity' | 'max_quantity' | 'price',
        value: string,
    ): void {
        const updated = data.tiers.map((tier, i) => {
            if (i !== index) return tier;
            if (field === 'max_quantity') {
                return {
                    ...tier,
                    max_quantity: value === '' ? null : Number(value),
                };
            }
            return { ...tier, [field]: value === '' ? '' : Number(value) };
        });
        setData('tiers', updated);
    }

    function submitTiers(e: React.FormEvent): void {
        e.preventDefault();
        post(
            ProductVariantController.savePriceTiers.url([
                product.id,
                variant.id,
            ]),
        );
    }
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
            title: 'Edit',
            href: ProductVariantController.edit.url([product.id, variant.id]),
        },
    ];

    const selectedAttributeValues = new Set(
        (variant.attribute_values ?? []).map((item) => item.attribute_value_id),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Variant: ${variant.name}`} />
            <Wrapper>
                <PageHeader
                    title={`Edit Variant: ${variant.name}`}
                    description={__(
                        'page.edit_variant_desc',
                        'Update variant details',
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
                                {__(
                                    'action.back_to_variants',
                                    'Back to Variants',
                                )}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={ProductVariantController.update.url([
                        product.id,
                        variant.id,
                    ])}
                    method="put"
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
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        defaultValue={variant.name}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">
                                        {__('label.sku', 'SKU')} *
                                    </Label>
                                    <Input
                                        id="sku"
                                        name="sku"
                                        required
                                        defaultValue={variant.sku}
                                    />
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
                                        defaultValue={(
                                            variant.price / 100
                                        ).toFixed(2)}
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
                                        defaultValue={(
                                            variant.cost_price / 100
                                        ).toFixed(2)}
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
                                        defaultValue={
                                            variant.compare_at_price
                                                ? (
                                                      variant.compare_at_price /
                                                      100
                                                  ).toFixed(2)
                                                : ''
                                        }
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
                                        defaultValue={variant.stock_quantity}
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
                                        defaultValue={variant.stock_threshold}
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
                                        defaultValue={variant.weight ?? ''}
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
                                        defaultValue={variant.tax_rate_id ?? ''}
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
                                        {attributes.map((attribute) => {
                                            const currentValue =
                                                attribute.values.find((value) =>
                                                    selectedAttributeValues.has(
                                                        value.id,
                                                    ),
                                                )?.id ?? '';

                                            return (
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
                                                        defaultValue={
                                                            currentValue
                                                        }
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
                                                                    key={
                                                                        value.id
                                                                    }
                                                                    value={
                                                                        value.id
                                                                    }
                                                                >
                                                                    {
                                                                        value.value
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            );
                                        })}
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
                                            defaultChecked={
                                                variant.backorder_allowed
                                            }
                                            className="h-4 w-4 rounded border-input"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="stock_status">
                                        Stock Status Override
                                    </Label>
                                    <select
                                        id="stock_status"
                                        name="stock_status"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        defaultValue={variant.stock_status}
                                    >
                                        <option value="in_stock">
                                            In Stock
                                        </option>
                                        <option value="out_of_stock">
                                            Out of Stock
                                        </option>
                                        <option value="backorder">
                                            Backorder
                                        </option>
                                        <option value="pre_order">
                                            Pre-Order
                                        </option>
                                    </select>
                                    <InputError message={errors.stock_status} />
                                </div>

                                {variant.stock_status === 'pre_order' && (
                                    <div className="space-y-1">
                                        <Label htmlFor="available_at">
                                            Available From
                                        </Label>
                                        <Input
                                            id="available_at"
                                            name="available_at"
                                            type="datetime-local"
                                            defaultValue={
                                                variant.available_at ?? ''
                                            }
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
                                        defaultChecked={variant.is_active}
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
                                        defaultChecked={variant.is_default}
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
                                    'action.save_changes',
                                    'Save Changes',
                                )}
                            />
                        </div>
                    )}
                </Form>
                {/* Tiered Pricing */}
                <form
                    onSubmit={submitTiers}
                    className="space-y-4 rounded-xl border bg-card p-6"
                >
                    <div>
                        <h2 className="text-base font-semibold">
                            Tiered Pricing (Quantity-Based)
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Set different prices based on quantity ordered.
                        </p>
                    </div>

                    {data.tiers.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="pr-4 pb-2 font-medium">
                                            Min Qty
                                        </th>
                                        <th className="pr-4 pb-2 font-medium">
                                            Max Qty
                                        </th>
                                        <th className="pr-4 pb-2 font-medium">
                                            Price (PLN)
                                        </th>
                                        <th className="pb-2 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.tiers.map((tier, index) => (
                                        <tr key={index} className="py-2">
                                            <td className="py-2 pr-4">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={tier.min_quantity}
                                                    onChange={(e) =>
                                                        updateTier(
                                                            index,
                                                            'min_quantity',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-24"
                                                    placeholder="1"
                                                />
                                                <InputError
                                                    message={
                                                        (
                                                            tierErrors as Record<
                                                                string,
                                                                string
                                                            >
                                                        )[
                                                            `tiers.${index}.min_quantity`
                                                        ]
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 pr-4">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        tier.max_quantity ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        updateTier(
                                                            index,
                                                            'max_quantity',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-24"
                                                    placeholder="∞"
                                                />
                                                <InputError
                                                    message={
                                                        (
                                                            tierErrors as Record<
                                                                string,
                                                                string
                                                            >
                                                        )[
                                                            `tiers.${index}.max_quantity`
                                                        ]
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 pr-4">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={tier.price}
                                                    onChange={(e) =>
                                                        updateTier(
                                                            index,
                                                            'price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-32"
                                                    placeholder="0.00"
                                                />
                                                <InputError
                                                    message={
                                                        (
                                                            tierErrors as Record<
                                                                string,
                                                                string
                                                            >
                                                        )[
                                                            `tiers.${index}.price`
                                                        ]
                                                    }
                                                />
                                            </td>
                                            <td className="py-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeTier(index)
                                                    }
                                                    aria-label="Remove tier"
                                                >
                                                    <TrashIcon className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {data.tiers.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No tiers configured. Base variant price applies to
                            all quantities.
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTier}
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Tier
                        </Button>
                        <Button
                            type="submit"
                            disabled={tierProcessing}
                            size="sm"
                        >
                            {tierProcessing ? 'Saving…' : 'Save Tiered Pricing'}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
