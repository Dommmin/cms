import { useAdminLocale } from '@/hooks/use-admin-locale';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';

interface Carrier {
    value: string;
    label: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Shipping Methods', href: '/admin/ecommerce/shipping-methods' },
    { title: 'Create', href: '/admin/ecommerce/shipping-methods/create' },
];

const formId = 'shipping-method-create-form';

export default function Create({ carriers }: { carriers: Carrier[] }) {
    const { locales } = usePage().props as { locales: SharedLocale[] };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);

    const __ = useTranslation();
    const [nameValues, setNameValues] = useState<Record<string, string>>({ [defaultLocale]: '' });
    const [descValues, setDescValues] = useState<Record<string, string>>({ [defaultLocale]: '' });
    const [carrier, setCarrier] = useState(carriers[0]?.value ?? '');
    const [isActive, setIsActive] = useState(true);
    const [basePrice, setBasePrice] = useState('');
    const [pricePerKg, setPricePerKg] = useState('0');
    const [minWeight, setMinWeight] = useState('');
    const [maxWeight, setMaxWeight] = useState('');
    const [minOrderValue, setMinOrderValue] = useState('');
    const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        const formData: Record<string, unknown> = {
            carrier,
            is_active: isActive,
            base_price: Math.round(parseFloat(basePrice || '0') * 100),
            price_per_kg: Math.round(parseFloat(pricePerKg || '0') * 100),
            min_weight: minWeight ? parseFloat(minWeight) : null,
            max_weight: maxWeight ? parseFloat(maxWeight) : null,
            min_order_value: minOrderValue ? Math.round(parseFloat(minOrderValue) * 100) : null,
            free_shipping_threshold: freeShippingThreshold
                ? Math.round(parseFloat(freeShippingThreshold) * 100)
                : null,
        };

        locales.forEach((locale) => {
            formData[`name[${locale.code}]`] = nameValues[locale.code] ?? '';
            formData[`description[${locale.code}]`] = descValues[locale.code] ?? '';
        });

        router.post('/admin/ecommerce/shipping-methods', formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('page.create_shipping_method', 'Create Shipping Method')} />

            <Wrapper>
                <PageHeader
                    title={__('page.add_shipping_method', 'Add Shipping Method')}
                    description={__('page.add_shipping_method_desc', 'Create a new shipping method')}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                <Link href='/admin/ecommerce/shipping-methods' prefetch cacheFor={30}>
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
                                <h2 className="font-semibold">{__('misc.basic_information', 'Basic Information')}</h2>

                                <LocaleTabSwitcher
                                    locales={locales}
                                    activeLocale={activeLocale}
                                    onLocaleChange={setActiveLocale}
                                />

                                {locales.map((locale) => (
                                    <div
                                        key={locale.code}
                                        className={locale.code !== activeLocale ? 'hidden' : 'space-y-4'}
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor={`name-${locale.code}`}>
                                                {__('label.name', 'Name')} {locale.code === defaultLocale && '*'}
                                            </Label>
                                            <Input
                                                id={`name-${locale.code}`}
                                                value={nameValues[locale.code] ?? ''}
                                                onChange={(e) =>
                                                    setNameValues((prev) => ({
                                                        ...prev,
                                                        [locale.code]: e.target.value,
                                                    }))
                                                }
                                                placeholder={`e.g. DPD Standard (${locale.code.toUpperCase()})`}
                                                required={locale.code === defaultLocale}
                                                autoFocus={locale.code === defaultLocale}
                                            />
                                            <InputError message={errors[`name.${locale.code}`]} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor={`description-${locale.code}`}>
                                                {__('label.description', 'Description')}
                                            </Label>
                                            <Textarea
                                                id={`description-${locale.code}`}
                                                value={descValues[locale.code] ?? ''}
                                                onChange={(e) =>
                                                    setDescValues((prev) => ({
                                                        ...prev,
                                                        [locale.code]: e.target.value,
                                                    }))
                                                }
                                                placeholder={`Short description (${locale.code.toUpperCase()})`}
                                                rows={3}
                                            />
                                            <InputError message={errors[`description.${locale.code}`]} />
                                        </div>
                                    </div>
                                ))}

                                <div className="grid gap-2">
                                    <Label htmlFor="carrier">{__('label.carrier', 'Carrier')} *</Label>
                                    <Select value={carrier} onValueChange={setCarrier}>
                                        <SelectTrigger id="carrier">
                                            <SelectValue placeholder="Select carrier..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carriers.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
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
                                <h2 className="font-semibold">{__('misc.pricing', 'Pricing')}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {__('misc.prices_pln_note', 'Prices are in PLN (base currency). Enter values in full PLN (e.g. 9.99).')}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="base_price">{__('label.base_price', 'Base Price (PLN)')} *</Label>
                                        <Input
                                            id="base_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(e.target.value)}
                                            placeholder="9.99"
                                            required
                                        />
                                        <InputError message={errors.base_price} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="price_per_kg">{__('label.price_per_kg', 'Price per Kg (PLN)')}</Label>
                                        <Input
                                            id="price_per_kg"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={pricePerKg}
                                            onChange={(e) => setPricePerKg(e.target.value)}
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.price_per_kg} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_order_value">
                                            {__('label.min_order_value', 'Min. Order Value (PLN)')}
                                        </Label>
                                        <Input
                                            id="min_order_value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={minOrderValue}
                                            onChange={(e) => setMinOrderValue(e.target.value)}
                                            placeholder="Optional"
                                        />
                                        <InputError message={errors.min_order_value} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="free_shipping_threshold">
                                            {__('label.free_shipping_threshold', 'Free Shipping Threshold (PLN)')}
                                        </Label>
                                        <Input
                                            id="free_shipping_threshold"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={freeShippingThreshold}
                                            onChange={(e) => setFreeShippingThreshold(e.target.value)}
                                            placeholder="e.g. 200 for free shipping above 200 PLN"
                                        />
                                        <InputError message={errors.free_shipping_threshold} />
                                    </div>
                                </div>
                            </div>

                            {/* Weight limits */}
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">{__('misc.weight_limits', 'Weight Limits')}</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_weight">{__('label.min_weight', 'Min. Weight (kg)')}</Label>
                                        <Input
                                            id="min_weight"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={minWeight}
                                            onChange={(e) => setMinWeight(e.target.value)}
                                            placeholder="Optional"
                                        />
                                        <InputError message={errors.min_weight} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="max_weight">{__('label.max_weight', 'Max. Weight (kg)')}</Label>
                                        <Input
                                            id="max_weight"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={maxWeight}
                                            onChange={(e) => setMaxWeight(e.target.value)}
                                            placeholder="Optional"
                                        />
                                        <InputError message={errors.max_weight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    {__('column.status', 'Status')}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label htmlFor="is_active" className="font-normal">
                                        {__('label.active', 'Active')}
                                    </Label>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    {__('misc.summary', 'Summary')}
                                </h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">{__('column.carrier', 'Carrier')}</dt>
                                        <dd className="font-medium">
                                            {carriers.find((c) => c.value === carrier)?.label || '—'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">{__('label.base_price', 'Base price')}</dt>
                                        <dd className="font-medium">
                                            {basePrice ? `${basePrice} PLN` : '—'}
                                        </dd>
                                    </div>
                                    {freeShippingThreshold && (
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">{__('misc.free_from', 'Free from')}</dt>
                                            <dd className="font-medium text-green-600 dark:text-green-400">
                                                {freeShippingThreshold} PLN
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </div>

                    <StickyFormActions
                        formId={formId}
                        processing={processing}
                        submitLabel={__('action.create_shipping_method', 'Create Shipping Method')}
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
