import { Link, Form, Head } from '@inertiajs/react';
import * as TaxRateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/TaxRateController';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const COMMON_COUNTRIES = [
    { code: 'PL', name: 'Poland' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'CN', name: 'China' },
];

export default function Edit({
    taxRate,
}: {
    taxRate: {
        id: number;
        name: string;
        rate: number;
        country_code?: string;
        is_active: boolean;
        is_default: boolean;
    };
}) {
    const __ = useTranslation();
    const formId = 'tax-rate-edit-form';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tax Rates',
            href: TaxRateController.index.url(),
        },
        {
            title: 'Edit Tax Rate',
            href: TaxRateController.edit.url(taxRate.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tax Rate" />

            <Wrapper>
                <PageHeader
                    title={__('page.edit_tax_rate', 'Edit Tax Rate')}
                    description={`Update details for ${taxRate.name}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={TaxRateController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={TaxRateController.update.url(taxRate.id)}
                    method="put"
                    id={formId}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {__('label.name', 'Name')}
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="Standard VAT"
                                    defaultValue={taxRate.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="rate">Rate (%)</Label>
                                <Input
                                    id="rate"
                                    name="rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    required
                                    placeholder="23"
                                    defaultValue={taxRate.rate}
                                />
                                <InputError message={errors.rate} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="country_code">
                                    Country (optional)
                                </Label>
                                <select
                                    id="country_code"
                                    name="country_code"
                                    defaultValue={taxRate.country_code ?? ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">All countries</option>
                                    {COMMON_COUNTRIES.map((country) => (
                                        <option
                                            key={country.code}
                                            value={country.code}
                                        >
                                            {country.name} ({country.code})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.country_code} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        value="1"
                                        defaultChecked={taxRate.is_active}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="font-normal"
                                    >
                                        {__('label.is_active', 'Active')}
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        name="is_default"
                                        value="1"
                                        defaultChecked={taxRate.is_default}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_default"
                                        className="font-normal"
                                    >
                                        {__(
                                            'label.is_default',
                                            'Default tax rate',
                                        )}
                                    </Label>
                                </div>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={__(
                                    'action.save_changes',
                                    'Save Changes',
                                )}
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
