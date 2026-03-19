import { Link, Form, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const DISCOUNT_TYPES = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed_amount', label: 'Fixed Amount' },
    { value: 'free_shipping', label: 'Free Shipping' },
];

export default function Edit({
    discount,
}: {
    discount: {
        id: number;
        code: string;
        name: string;
        type: string;
        value: number;
        is_active: boolean;
        max_uses?: number;
        min_order_value?: number;
    };
}) {
    const __ = useTranslation();
    const formId = 'discount-edit-form';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Discounts',
            href: '/admin/ecommerce/discounts',
        },
        {
            title: 'Edit Discount',
            href: `/admin/ecommerce/discounts/${discount.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Discount" />

            <Wrapper>
                <PageHeader
                    title={__('action.edit', 'Edit Discount')}
                    description={`Update details for ${discount.name}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href='/admin/ecommerce/discounts' prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={`/admin/ecommerce/discounts/${discount.id}`}
                    method="put"
                    id={formId}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{__('label.name', 'Name')}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="Discount name"
                                    defaultValue={discount.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="code">{__('label.code', 'Code')}</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    required
                                    placeholder="DISCOUNT20"
                                    className="font-mono uppercase"
                                    defaultValue={discount.code}
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">{__('label.type', 'Discount Type')}</Label>
                                <select
                                    id="type"
                                    name="type"
                                    defaultValue={discount.type}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {DISCOUNT_TYPES.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="value">{__('label.value', 'Value')}</Label>
                                <Input
                                    id="value"
                                    name="value"
                                    type="number"
                                    min="0"
                                    step="1"
                                    required
                                    placeholder="20"
                                    defaultValue={discount.value}
                                />
                                <InputError message={errors.value} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="min_order_value">
                                    Minimum Order Value (optional)
                                </Label>
                                <Input
                                    id="min_order_value"
                                    name="min_order_value"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    defaultValue={discount.min_order_value}
                                />
                                <InputError message={errors.min_order_value} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="max_uses">
                                    Maximum Uses (optional)
                                </Label>
                                <Input
                                    id="max_uses"
                                    name="max_uses"
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                    defaultValue={discount.max_uses}
                                />
                                <InputError message={errors.max_uses} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={discount.is_active}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    {__('label.is_active', 'Active')}
                                </Label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={__('action.save_changes', 'Save Changes')}
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
