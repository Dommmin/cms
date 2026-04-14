import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import * as ShippingMethodController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ShippingMethodController';
import InputError from '@/components/input-error';
import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
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
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useAdminLocale } from '@/hooks/use-admin-locale';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { Carrier, ShippingMethod } from './edit.types';

const formId = 'shipping-method-edit-form';

export default function Edit({
    method,
    carriers,
}: {
    method: ShippingMethod;
    carriers: Carrier[];
}) {
    const { locales } = usePage().props as { locales: SharedLocale[] };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);

    const __ = useTranslation();
    const [nameValues, setNameValues] = useState<Record<string, string>>(
        method.name ?? { [defaultLocale]: '' },
    );
    const [descValues, setDescValues] = useState<Record<string, string>>(
        method.description ?? { [defaultLocale]: '' },
    );

    const [carrier, setCarrier] = useState(method.carrier);
    const [isActive, setIsActive] = useState(method.is_active);
    const [basePrice, setBasePrice] = useState(
        (method.base_price / 100).toFixed(2),
    );
    const [pricePerKg, setPricePerKg] = useState(
        (method.price_per_kg / 100).toFixed(2),
    );
    const [minWeight, setMinWeight] = useState(
        method.min_weight?.toString() ?? '',
    );
    const [maxWeight, setMaxWeight] = useState(
        method.max_weight?.toString() ?? '',
    );
    const [minOrderValue, setMinOrderValue] = useState(
        method.min_order_value ? (method.min_order_value / 100).toFixed(2) : '',
    );
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(
        method.free_shipping_threshold
            ? (method.free_shipping_threshold / 100).toFixed(2)
            : '',
    );
    const [estimatedDaysMin, setEstimatedDaysMin] = useState(
        method.estimated_days_min?.toString() ?? '',
    );
    const [estimatedDaysMax, setEstimatedDaysMax] = useState(
        method.estimated_days_max?.toString() ?? '',
    );
    const [maxLengthCm, setMaxLengthCm] = useState(
        method.max_length_cm?.toString() ?? '',
    );
    const [maxWidthCm, setMaxWidthCm] = useState(
        method.max_width_cm?.toString() ?? '',
    );
    const [maxDepthCm, setMaxDepthCm] = useState(
        method.max_depth_cm?.toString() ?? '',
    );
    const [requiresSignature, setRequiresSignature] = useState(
        method.requires_signature,
    );
    const [insuranceAvailable, setInsuranceAvailable] = useState(
        method.insurance_available,
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Shipping Methods',
            href: ShippingMethodController.index.url(),
        },
        {
            title: nameValues[defaultLocale] ?? nameValues['en'] ?? 'Edit',
            href: '',
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        const formData: Record<string, string | number | boolean | null> = {
            carrier,
            is_active: isActive,
            base_price: Math.round(parseFloat(basePrice || '0') * 100),
            price_per_kg: Math.round(parseFloat(pricePerKg || '0') * 100),
            min_weight: minWeight ? parseFloat(minWeight) : null,
            max_weight: maxWeight ? parseFloat(maxWeight) : null,
            min_order_value: minOrderValue
                ? Math.round(parseFloat(minOrderValue) * 100)
                : null,
            free_shipping_threshold: freeShippingThreshold
                ? Math.round(parseFloat(freeShippingThreshold) * 100)
                : null,
            estimated_days_min: estimatedDaysMin
                ? parseInt(estimatedDaysMin, 10)
                : null,
            estimated_days_max: estimatedDaysMax
                ? parseInt(estimatedDaysMax, 10)
                : null,
            max_length_cm: maxLengthCm ? parseInt(maxLengthCm, 10) : null,
            max_width_cm: maxWidthCm ? parseInt(maxWidthCm, 10) : null,
            max_depth_cm: maxDepthCm ? parseInt(maxDepthCm, 10) : null,
            requires_signature: requiresSignature,
            insurance_available: insuranceAvailable,
        };

        locales.forEach((locale) => {
            formData[`name[${locale.code}]`] = nameValues[locale.code] ?? '';
            formData[`description[${locale.code}]`] =
                descValues[locale.code] ?? '';
        });

        router.put(ShippingMethodController.update.url(method.id), formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${__('page.edit_shipping_method', 'Edit Shipping Method')}: ${nameValues[defaultLocale] ?? nameValues['en'] ?? ''}`}
            />

            <Wrapper>
                <PageHeader
                    title={__(
                        'page.edit_shipping_method',
                        'Edit Shipping Method',
                    )}
                    description={`Update settings for ${nameValues[defaultLocale] ?? nameValues['en'] ?? ''}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ShippingMethodController.index.url()}
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
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic Info with locale tabs */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__(
                                        'misc.basic_information',
                                        'Basic Information',
                                    )}
                                </h2>

                                <LocaleTabSwitcher
                                    locales={locales}
                                    activeLocale={activeLocale}
                                    onLocaleChange={setActiveLocale}
                                />

                                {locales.map((locale) => (
                                    <div
                                        key={locale.code}
                                        className={
                                            locale.code !== activeLocale
                                                ? 'hidden'
                                                : 'space-y-4'
                                        }
                                    >
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`name-${locale.code}`}
                                            >
                                                {__('label.name', 'Name')}{' '}
                                                {locale.code ===
                                                    defaultLocale && '*'}
                                            </Label>
                                            <Input
                                                id={`name-${locale.code}`}
                                                value={
                                                    nameValues[locale.code] ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setNameValues((prev) => ({
                                                        ...prev,
                                                        [locale.code]:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder={`e.g. DPD Standard (${locale.code.toUpperCase()})`}
                                                required={
                                                    locale.code ===
                                                    defaultLocale
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `name.${locale.code}`
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`description-${locale.code}`}
                                            >
                                                {__(
                                                    'label.description',
                                                    'Description',
                                                )}
                                            </Label>
                                            <Textarea
                                                id={`description-${locale.code}`}
                                                value={
                                                    descValues[locale.code] ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setDescValues((prev) => ({
                                                        ...prev,
                                                        [locale.code]:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder={`Short description (${locale.code.toUpperCase()})`}
                                                rows={3}
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `description.${locale.code}`
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="grid gap-2">
                                    <Label htmlFor="carrier">
                                        {__('label.carrier', 'Carrier')} *
                                    </Label>
                                    <Select
                                        value={carrier}
                                        onValueChange={setCarrier}
                                    >
                                        <SelectTrigger id="carrier">
                                            <SelectValue placeholder="Select carrier..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carriers.map((c) => (
                                                <SelectItem
                                                    key={c.value}
                                                    value={c.value}
                                                >
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.carrier} />
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__('misc.pricing', 'Pricing')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {__(
                                        'misc.prices_pln_note',
                                        'Prices are in PLN (base currency). Enter values in full PLN (e.g. 9.99).',
                                    )}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="base_price">
                                            {__(
                                                'label.base_price',
                                                'Base Price (PLN)',
                                            )}{' '}
                                            *
                                        </Label>
                                        <Input
                                            id="base_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={basePrice}
                                            onChange={(e) =>
                                                setBasePrice(e.target.value)
                                            }
                                            placeholder="9.99"
                                            required
                                        />
                                        <InputError
                                            message={errors.base_price}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="price_per_kg">
                                            {__(
                                                'label.price_per_kg',
                                                'Price per Kg (PLN)',
                                            )}
                                        </Label>
                                        <Input
                                            id="price_per_kg"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={pricePerKg}
                                            onChange={(e) =>
                                                setPricePerKg(e.target.value)
                                            }
                                            placeholder="0.00"
                                        />
                                        <InputError
                                            message={errors.price_per_kg}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_order_value">
                                            {__(
                                                'label.min_order_value',
                                                'Min. Order Value (PLN)',
                                            )}
                                        </Label>
                                        <Input
                                            id="min_order_value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={minOrderValue}
                                            onChange={(e) =>
                                                setMinOrderValue(e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError
                                            message={errors.min_order_value}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="free_shipping_threshold">
                                            {__(
                                                'label.free_shipping_threshold',
                                                'Free Shipping Threshold (PLN)',
                                            )}
                                        </Label>
                                        <Input
                                            id="free_shipping_threshold"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={freeShippingThreshold}
                                            onChange={(e) =>
                                                setFreeShippingThreshold(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 200"
                                        />
                                        <InputError
                                            message={
                                                errors.free_shipping_threshold
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Weight limits */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__('misc.weight_limits', 'Weight Limits')}
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_weight">
                                            {__(
                                                'label.min_weight',
                                                'Min. Weight (kg)',
                                            )}
                                        </Label>
                                        <Input
                                            id="min_weight"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={minWeight}
                                            onChange={(e) =>
                                                setMinWeight(e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError
                                            message={errors.min_weight}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="max_weight">
                                            {__(
                                                'label.max_weight',
                                                'Max. Weight (kg)',
                                            )}
                                        </Label>
                                        <Input
                                            id="max_weight"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={maxWeight}
                                            onChange={(e) =>
                                                setMaxWeight(e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError
                                            message={errors.max_weight}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Time */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__('misc.delivery_time', 'Delivery Time')}
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="estimated_days_min">
                                            {__(
                                                'label.estimated_days_min',
                                                'Min. delivery days',
                                            )}
                                        </Label>
                                        <Input
                                            id="estimated_days_min"
                                            type="number"
                                            min="0"
                                            max="365"
                                            value={estimatedDaysMin}
                                            onChange={(e) =>
                                                setEstimatedDaysMin(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 1"
                                        />
                                        <InputError
                                            message={errors.estimated_days_min}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="estimated_days_max">
                                            {__(
                                                'label.estimated_days_max',
                                                'Max. delivery days',
                                            )}
                                        </Label>
                                        <Input
                                            id="estimated_days_max"
                                            type="number"
                                            min="0"
                                            max="365"
                                            value={estimatedDaysMax}
                                            onChange={(e) =>
                                                setEstimatedDaysMax(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 3"
                                        />
                                        <InputError
                                            message={errors.estimated_days_max}
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {__(
                                        'misc.delivery_time_help',
                                        'Business days for delivery estimate shown to customers',
                                    )}
                                </p>
                            </div>

                            {/* Dimensions */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__('misc.dimensions', 'Dimensions')}
                                </h2>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="max_length_cm">
                                            {__(
                                                'label.max_length_cm',
                                                'Max Length (cm)',
                                            )}
                                        </Label>
                                        <Input
                                            id="max_length_cm"
                                            type="number"
                                            min="1"
                                            max="9999"
                                            value={maxLengthCm}
                                            onChange={(e) =>
                                                setMaxLengthCm(e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError
                                            message={errors.max_length_cm}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="max_width_cm">
                                            {__(
                                                'label.max_width_cm',
                                                'Max Width (cm)',
                                            )}
                                        </Label>
                                        <Input
                                            id="max_width_cm"
                                            type="number"
                                            min="1"
                                            max="9999"
                                            value={maxWidthCm}
                                            onChange={(e) =>
                                                setMaxWidthCm(e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError
                                            message={errors.max_width_cm}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="max_depth_cm">
                                            {__(
                                                'label.max_depth_cm',
                                                'Max Depth (cm)',
                                            )}
                                        </Label>
                                        <Input
                                            id="max_depth_cm"
                                            type="number"
                                            min="1"
                                            max="9999"
                                            value={maxDepthCm}
                                            onChange={(e) =>
                                                setMaxDepthCm(e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError
                                            message={errors.max_depth_cm}
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {__(
                                        'misc.dimensions_help',
                                        'Leave empty for no dimension restrictions',
                                    )}
                                </p>
                            </div>

                            {/* Service Options */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">
                                    {__(
                                        'misc.service_options',
                                        'Service Options',
                                    )}
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="requires_signature"
                                            checked={requiresSignature}
                                            onChange={(e) =>
                                                setRequiresSignature(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-input"
                                        />
                                        <Label
                                            htmlFor="requires_signature"
                                            className="font-normal"
                                        >
                                            {__(
                                                'label.requires_signature',
                                                'Requires signature on delivery',
                                            )}
                                        </Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="insurance_available"
                                            checked={insuranceAvailable}
                                            onChange={(e) =>
                                                setInsuranceAvailable(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-input"
                                        />
                                        <Label
                                            htmlFor="insurance_available"
                                            className="font-normal"
                                        >
                                            {__(
                                                'label.insurance_available',
                                                'Insurance available',
                                            )}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    {__('column.status', 'Status')}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={isActive}
                                        onChange={(e) =>
                                            setIsActive(e.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="font-normal"
                                    >
                                        {__('label.active', 'Active')}
                                    </Label>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    {__('misc.stats', 'Stats')}
                                </h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {__(
                                                'column.shipments',
                                                'Shipments',
                                            )}
                                        </dt>
                                        <dd className="font-medium">
                                            {method.shipments_count}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {__('column.carrier', 'Carrier')}
                                        </dt>
                                        <dd className="font-medium">
                                            {carriers.find(
                                                (c) => c.value === carrier,
                                            )?.label || carrier}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            {__(
                                                'label.base_price',
                                                'Base price',
                                            )}
                                        </dt>
                                        <dd className="font-medium">
                                            {basePrice
                                                ? `${basePrice} PLN`
                                                : '—'}
                                        </dd>
                                    </div>
                                    {freeShippingThreshold && (
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                {__(
                                                    'misc.free_from',
                                                    'Free from',
                                                )}
                                            </dt>
                                            <dd className="font-medium text-green-600 dark:text-green-400">
                                                {freeShippingThreshold} PLN
                                            </dd>
                                        </div>
                                    )}
                                    {(estimatedDaysMin || estimatedDaysMax) && (
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                {__(
                                                    'misc.delivery',
                                                    'Delivery',
                                                )}
                                            </dt>
                                            <dd className="font-medium">
                                                {estimatedDaysMin &&
                                                estimatedDaysMax
                                                    ? `${estimatedDaysMin}–${estimatedDaysMax} ${__('misc.business_days', 'business days')}`
                                                    : `${__('misc.up_to', 'up to')} ${estimatedDaysMax} ${__('misc.business_days', 'business days')}`}
                                            </dd>
                                        </div>
                                    )}
                                    {(maxLengthCm ||
                                        maxWidthCm ||
                                        maxDepthCm) && (
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                {__(
                                                    'misc.max_dimensions',
                                                    'Max dimensions',
                                                )}
                                            </dt>
                                            <dd className="font-medium">
                                                {[
                                                    maxLengthCm || '?',
                                                    maxWidthCm || '?',
                                                    maxDepthCm || '?',
                                                ].join('×')}{' '}
                                                cm
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                                {(requiresSignature || insuranceAvailable) && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {requiresSignature && (
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                {__(
                                                    'label.signature_required',
                                                    'Signature required',
                                                )}
                                            </span>
                                        )}
                                        {insuranceAvailable && (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                {__(
                                                    'label.insurance_available',
                                                    'Insurance available',
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <StickyFormActions
                        formId={formId}
                        processing={processing}
                        submitLabel={__('action.save_changes', 'Save Changes')}
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
