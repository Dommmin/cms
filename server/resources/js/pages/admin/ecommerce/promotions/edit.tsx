import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as PromotionController from '@/actions/App/Http/Controllers/Admin/Ecommerce/PromotionController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { Category, FormData, Product, Promotion } from './edit.types';

const formId = 'promotion-edit-form';

export default function Edit({
    promotion,
    categories,
    products,
}: {
    promotion: Promotion;
    categories: Category[];
    products: Product[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Promotions', href: PromotionController.index.url() },
        { title: promotion.name, href: '' },
    ];

    const __ = useTranslation();
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: promotion.name,
        slug: promotion.slug,
        description: promotion.description || '',
        type: promotion.type,
        value: promotion.value?.toString() || '',
        min_value: promotion.min_value?.toString() || '',
        max_discount: promotion.max_discount?.toString() || '',
        apply_to: promotion.apply_to,
        is_active: promotion.is_active,
        is_stackable: promotion.is_stackable,
        priority: promotion.priority.toString(),
        starts_at: promotion.starts_at
            ? new Date(promotion.starts_at).toISOString().slice(0, 16)
            : '',
        ends_at: promotion.ends_at
            ? new Date(promotion.ends_at).toISOString().slice(0, 16)
            : '',
        products: promotion.products.reduce(
            (acc, product) => {
                acc[product.id.toString()] = {
                    discount_value:
                        product.pivot.discount_value?.toString() || '',
                    discount_type:
                        product.pivot.discount_type || promotion.type,
                };
                return acc;
            },
            {} as Record<
                string,
                { discount_value: string; discount_type: string }
            >,
        ),
        categories: promotion.categories.reduce(
            (acc, category) => {
                acc[category.id.toString()] = {
                    discount_value:
                        category.pivot.discount_value?.toString() || '',
                    discount_type:
                        category.pivot.discount_type || promotion.type,
                };
                return acc;
            },
            {} as Record<
                string,
                { discount_value: string; discount_type: string }
            >,
        ),
        metadata: {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(PromotionController.update.url(promotion.id));
    };

    const handleNameChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            name: value,
            slug: prev.slug === promotion.slug ? slugify(value) : prev.slug,
        }));
    };

    const toggleProduct = (productId: string, checked: boolean) => {
        const newProducts = { ...data.products };
        if (checked) {
            newProducts[productId] = {
                discount_value: '',
                discount_type:
                    data.type === 'buy_x_get_y' ? 'percentage' : data.type,
            };
        } else {
            delete newProducts[productId];
        }
        setData('products', newProducts);
    };

    const toggleCategory = (categoryId: string, checked: boolean) => {
        const newCategories = { ...data.categories };
        if (checked) {
            newCategories[categoryId] = {
                discount_value: '',
                discount_type:
                    data.type === 'buy_x_get_y' ? 'percentage' : data.type,
            };
        } else {
            delete newCategories[categoryId];
        }
        setData('categories', newCategories);
    };

    const updateProductDiscount = (
        productId: string,
        field: 'discount_value' | 'discount_type',
        value: string,
    ) => {
        setData('products', {
            ...data.products,
            [productId]: { ...data.products[productId], [field]: value },
        });
    };

    const updateCategoryDiscount = (
        categoryId: string,
        field: 'discount_value' | 'discount_type',
        value: string,
    ) => {
        setData('categories', {
            ...data.categories,
            [categoryId]: { ...data.categories[categoryId], [field]: value },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Promotion: ${promotion.name}`} />

            <Wrapper>
                <PageHeader
                    title={__('page.edit_promotion', 'Edit Promotion')}
                    description={`${__('misc.updating_promotion', 'Updating promotion')}: ${promotion.name}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={PromotionController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form id={formId} onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic info */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__('misc.basic_info', 'Basic Information')}
                                </h2>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {__(
                                            'label.promotion_name',
                                            'Promotion Name',
                                        )}{' '}
                                        *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            handleNameChange(e.target.value)
                                        }
                                        placeholder="np. Black Friday 2024"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">
                                        {__('label.slug', 'Slug')} *
                                    </Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) =>
                                            setData(
                                                'slug',
                                                slugify(e.target.value),
                                            )
                                        }
                                        placeholder="black-friday-2024"
                                        required
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        {__('label.description', 'Description')}
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={__(
                                            'placeholder.promotion_description',
                                            'Detailed description of the promotion...',
                                        )}
                                        rows={3}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            {/* Promotion settings */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__(
                                        'misc.promotion_settings',
                                        'Promotion Settings',
                                    )}
                                </h2>

                                <div className="grid gap-2">
                                    <Label htmlFor="type">
                                        {__(
                                            'label.promotion_type',
                                            'Promotion Type',
                                        )}
                                    </Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(
                                            value: FormData['type'],
                                        ) => setData('type', value)}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">
                                                {__(
                                                    'type.percentage',
                                                    'Percentage Discount',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="fixed_amount">
                                                {__(
                                                    'type.fixed_amount',
                                                    'Fixed Amount',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="buy_x_get_y">
                                                {__(
                                                    'type.buy_x_get_y',
                                                    'Buy X Get Y',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="free_shipping">
                                                {__(
                                                    'type.free_shipping',
                                                    'Free Shipping',
                                                )}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                {data.type !== 'free_shipping' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="value">
                                            {__('label.value', 'Value')}{' '}
                                            {data.type === 'percentage'
                                                ? '(%)'
                                                : '(PLN)'}
                                        </Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.value}
                                            onChange={(e) =>
                                                setData('value', e.target.value)
                                            }
                                            placeholder={
                                                data.type === 'percentage'
                                                    ? '20'
                                                    : '50'
                                            }
                                            required
                                        />
                                        <InputError message={errors.value} />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_value">
                                            {__(
                                                'label.min_order_value',
                                                'Min. Order Value (PLN)',
                                            )}
                                        </Label>
                                        <Input
                                            id="min_value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.min_value}
                                            onChange={(e) =>
                                                setData(
                                                    'min_value',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="100"
                                        />
                                        <InputError
                                            message={errors.min_value}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="max_discount">
                                            {__(
                                                'label.max_discount',
                                                'Max. Discount (PLN)',
                                            )}
                                        </Label>
                                        <Input
                                            id="max_discount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.max_discount}
                                            onChange={(e) =>
                                                setData(
                                                    'max_discount',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="200"
                                        />
                                        <InputError
                                            message={errors.max_discount}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="apply_to">
                                        {__('label.apply_to', 'Apply To')}
                                    </Label>
                                    <Select
                                        value={data.apply_to}
                                        onValueChange={(
                                            value: FormData['apply_to'],
                                        ) => setData('apply_to', value)}
                                    >
                                        <SelectTrigger id="apply_to">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                {__(
                                                    'apply_to.all',
                                                    'All Products',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="specific_products">
                                                {__(
                                                    'apply_to.specific_products',
                                                    'Specific Products',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="specific_categories">
                                                {__(
                                                    'apply_to.specific_categories',
                                                    'Specific Categories',
                                                )}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.apply_to} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="starts_at">
                                            {__(
                                                'label.starts_at',
                                                'Start Date',
                                            )}
                                        </Label>
                                        <Input
                                            id="starts_at"
                                            type="datetime-local"
                                            value={data.starts_at}
                                            onChange={(e) =>
                                                setData(
                                                    'starts_at',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="ends_at">
                                            {__('label.ends_at', 'End Date')}
                                        </Label>
                                        <Input
                                            id="ends_at"
                                            type="datetime-local"
                                            value={data.ends_at}
                                            onChange={(e) =>
                                                setData(
                                                    'ends_at',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Products / categories selection */}
                            {(data.apply_to === 'specific_products' ||
                                data.apply_to === 'specific_categories') && (
                                <div className="rounded-xl border bg-card p-6">
                                    <h2 className="mb-1 font-semibold">
                                        {data.apply_to === 'specific_products'
                                            ? __(
                                                  'misc.selected_products',
                                                  'Selected Products',
                                              )
                                            : __(
                                                  'misc.selected_categories',
                                                  'Selected Categories',
                                              )}
                                    </h2>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        {data.apply_to === 'specific_products'
                                            ? __(
                                                  'misc.select_products_desc',
                                                  'Select products included in the promotion',
                                              )
                                            : __(
                                                  'misc.select_categories_desc',
                                                  'Select categories included in the promotion',
                                              )}
                                    </p>

                                    <div className="space-y-3">
                                        {data.apply_to ===
                                            'specific_products' &&
                                            products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={
                                                                !!data.products[
                                                                    product.id.toString()
                                                                ]
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                toggleProduct(
                                                                    product.id.toString(),
                                                                    !!checked,
                                                                )
                                                            }
                                                        />
                                                        <div>
                                                            <div className="font-medium">
                                                                {resolveLocalizedText(
                                                                    product.name,
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {(
                                                                    product.price /
                                                                    100
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                PLN
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {data.products[
                                                        product.id.toString()
                                                    ] && (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                placeholder={__(
                                                                    'placeholder.value',
                                                                    'Value',
                                                                )}
                                                                value={
                                                                    data
                                                                        .products[
                                                                        product.id.toString()
                                                                    ]
                                                                        .discount_value
                                                                }
                                                                onChange={(e) =>
                                                                    updateProductDiscount(
                                                                        product.id.toString(),
                                                                        'discount_value',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-24"
                                                            />
                                                            <Select
                                                                value={
                                                                    data
                                                                        .products[
                                                                        product.id.toString()
                                                                    ]
                                                                        .discount_type
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updateProductDiscount(
                                                                        product.id.toString(),
                                                                        'discount_type',
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-28">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="percentage">
                                                                        %
                                                                    </SelectItem>
                                                                    <SelectItem value="fixed_amount">
                                                                        PLN
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                        {data.apply_to ===
                                            'specific_categories' &&
                                            categories.map((category) => (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={
                                                                !!data
                                                                    .categories[
                                                                    category.id.toString()
                                                                ]
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                toggleCategory(
                                                                    category.id.toString(),
                                                                    !!checked,
                                                                )
                                                            }
                                                        />
                                                        <div className="font-medium">
                                                            {resolveLocalizedText(
                                                                category.name,
                                                            )}
                                                        </div>
                                                    </div>
                                                    {data.categories[
                                                        category.id.toString()
                                                    ] && (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                placeholder={__(
                                                                    'placeholder.value',
                                                                    'Value',
                                                                )}
                                                                value={
                                                                    data
                                                                        .categories[
                                                                        category.id.toString()
                                                                    ]
                                                                        .discount_value
                                                                }
                                                                onChange={(e) =>
                                                                    updateCategoryDiscount(
                                                                        category.id.toString(),
                                                                        'discount_value',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-24"
                                                            />
                                                            <Select
                                                                value={
                                                                    data
                                                                        .categories[
                                                                        category.id.toString()
                                                                    ]
                                                                        .discount_type
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updateCategoryDiscount(
                                                                        category.id.toString(),
                                                                        'discount_type',
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-28">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="percentage">
                                                                        %
                                                                    </SelectItem>
                                                                    <SelectItem value="fixed_amount">
                                                                        PLN
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    Status
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData('is_active', !!checked)
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="font-normal"
                                        >
                                            {__('label.active', 'Active')}
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_stackable"
                                            checked={data.is_stackable}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_stackable',
                                                    !!checked,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_stackable"
                                            className="font-normal"
                                        >
                                            {__('label.stackable', 'Stackable')}
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    {__('misc.priority', 'Priority')}
                                </h3>
                                <Input
                                    id="priority"
                                    type="number"
                                    min="0"
                                    value={data.priority}
                                    onChange={(e) =>
                                        setData('priority', e.target.value)
                                    }
                                    placeholder="0"
                                />
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    {__(
                                        'misc.priority_note',
                                        'Higher priority = applied first',
                                    )}
                                </p>
                                <InputError message={errors.priority} />
                            </div>

                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    {__('misc.preview', 'Preview')}
                                </h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {__('label.name', 'Name')}
                                        </dt>
                                        <dd className="font-medium">
                                            {data.name || '—'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {__('column.type', 'Type')}
                                        </dt>
                                        <dd className="font-medium">
                                            {data.type === 'percentage'
                                                ? __(
                                                      'type.percentage',
                                                      'Percentage Discount',
                                                  )
                                                : data.type === 'fixed_amount'
                                                  ? __(
                                                        'type.fixed_amount',
                                                        'Fixed Amount',
                                                    )
                                                  : data.type === 'buy_x_get_y'
                                                    ? __(
                                                          'type.buy_x_get_y',
                                                          'Buy X Get Y',
                                                      )
                                                    : __(
                                                          'type.free_shipping',
                                                          'Free Shipping',
                                                      )}
                                        </dd>
                                    </div>
                                    {data.type !== 'free_shipping' &&
                                        data.value && (
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">
                                                    {__('label.value', 'Value')}
                                                </dt>
                                                <dd className="font-medium">
                                                    {data.value}
                                                    {data.type === 'percentage'
                                                        ? '%'
                                                        : ' PLN'}
                                                </dd>
                                            </div>
                                        )}
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {__('column.status', 'Status')}
                                        </dt>
                                        <dd
                                            className={
                                                data.is_active
                                                    ? 'font-medium text-green-600 dark:text-green-400'
                                                    : 'font-medium text-muted-foreground'
                                            }
                                        >
                                            {data.is_active
                                                ? __('status.active', 'Active')
                                                : __(
                                                      'status.inactive',
                                                      'Inactive',
                                                  )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <StickyFormActions
                        formId={formId}
                        processing={processing}
                        submitLabel={__('action.save_changes', 'Save Changes')}
                        processingLabel={__('misc.saving', 'Saving...')}
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
