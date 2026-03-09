import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Carrier {
    value: string;
    label: string;
}

interface ShippingMethod {
    id: number;
    name: string;
    carrier: string;
    is_active: boolean;
    base_price: number;
    price_per_kg: number;
    min_weight: number | null;
    max_weight: number | null;
    min_order_value: number | null;
    free_shipping_threshold: number | null;
    shipments_count: number;
}

interface FormData {
    name: string;
    carrier: string;
    is_active: boolean;
    base_price: string;
    price_per_kg: string;
    min_weight: string;
    max_weight: string;
    min_order_value: string;
    free_shipping_threshold: string;
}

const formId = 'shipping-method-edit-form';

export default function Edit({
    method,
    carriers,
}: {
    method: ShippingMethod;
    carriers: Carrier[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Shipping Methods', href: '/admin/ecommerce/shipping-methods' },
        { title: method.name, href: '' },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: method.name,
        carrier: method.carrier,
        is_active: method.is_active,
        base_price: (method.base_price / 100).toFixed(2),
        price_per_kg: (method.price_per_kg / 100).toFixed(2),
        min_weight: method.min_weight?.toString() ?? '',
        max_weight: method.max_weight?.toString() ?? '',
        min_order_value: method.min_order_value
            ? (method.min_order_value / 100).toFixed(2)
            : '',
        free_shipping_threshold: method.free_shipping_threshold
            ? (method.free_shipping_threshold / 100).toFixed(2)
            : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/ecommerce/shipping-methods/${method.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${method.name}`} />

            <Wrapper>
                <PageHeader
                    title="Edit Shipping Method"
                    description={`Update settings for ${method.name}`}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/ecommerce/shipping-methods')
                            }
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form id={formId} onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">Basic Information</h2>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. DPD Standard"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="carrier">Carrier *</Label>
                                    <Select
                                        value={data.carrier}
                                        onValueChange={(v) => setData('carrier', v)}
                                    >
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

                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">Pricing</h2>
                                <p className="text-sm text-muted-foreground">
                                    Prices are in PLN. Enter values in full PLN (e.g. 9.99).
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="base_price">Base Price (PLN) *</Label>
                                        <Input
                                            id="base_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.base_price}
                                            onChange={(e) => setData('base_price', e.target.value)}
                                            placeholder="9.99"
                                            required
                                        />
                                        <InputError message={errors.base_price} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="price_per_kg">Price per Kg (PLN)</Label>
                                        <Input
                                            id="price_per_kg"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price_per_kg}
                                            onChange={(e) =>
                                                setData('price_per_kg', e.target.value)
                                            }
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.price_per_kg} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_order_value">
                                            Min. Order Value (PLN)
                                        </Label>
                                        <Input
                                            id="min_order_value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.min_order_value}
                                            onChange={(e) =>
                                                setData('min_order_value', e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                        <InputError message={errors.min_order_value} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="free_shipping_threshold">
                                            Free Shipping Threshold (PLN)
                                        </Label>
                                        <Input
                                            id="free_shipping_threshold"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.free_shipping_threshold}
                                            onChange={(e) =>
                                                setData('free_shipping_threshold', e.target.value)
                                            }
                                            placeholder="e.g. 200"
                                        />
                                        <InputError message={errors.free_shipping_threshold} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                <h2 className="font-semibold">Weight Limits</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_weight">Min. Weight (kg)</Label>
                                        <Input
                                            id="min_weight"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={data.min_weight}
                                            onChange={(e) => setData('min_weight', e.target.value)}
                                            placeholder="Optional"
                                        />
                                        <InputError message={errors.min_weight} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="max_weight">Max. Weight (kg)</Label>
                                        <Input
                                            id="max_weight"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={data.max_weight}
                                            onChange={(e) => setData('max_weight', e.target.value)}
                                            placeholder="Optional"
                                        />
                                        <InputError message={errors.max_weight} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Status
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label htmlFor="is_active" className="font-normal">
                                        Active
                                    </Label>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Stats
                                </h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Shipments</dt>
                                        <dd className="font-medium">{method.shipments_count}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Carrier</dt>
                                        <dd className="font-medium">
                                            {carriers.find((c) => c.value === data.carrier)?.label ||
                                                data.carrier}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Base price</dt>
                                        <dd className="font-medium">
                                            {data.base_price ? `${data.base_price} PLN` : '—'}
                                        </dd>
                                    </div>
                                    {data.free_shipping_threshold && (
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Free from</dt>
                                            <dd className="font-medium text-green-600 dark:text-green-400">
                                                {data.free_shipping_threshold} PLN
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
                        submitLabel="Save Changes"
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
