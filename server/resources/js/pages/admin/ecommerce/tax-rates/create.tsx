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

export default function Create({
    taxRate,
}: {
    taxRate?: {
        id: number;
        name: string;
        rate: number;
        country_code?: string;
        is_active: boolean;
        is_default: boolean;
    };
}) {
    const isEditing = !!taxRate;
    const formId = isEditing ? 'tax-rate-edit-form' : 'tax-rate-create-form';
    const breadcrumbs: BreadcrumbItem[] = isEditing
        ? [
              {
                  title: 'Tax Rates',
                  href: '/admin/ecommerce/tax-rates',
              },
              {
                  title: 'Edit Tax Rate',
                  href: `/admin/ecommerce/tax-rates/${taxRate.id}/edit`,
              },
          ]
        : [
              {
                  title: 'Tax Rates',
                  href: '/admin/ecommerce/tax-rates',
              },
              {
                  title: 'Create Tax Rate',
                  href: '/admin/ecommerce/tax-rates/create',
              },
          ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Tax Rate' : 'Create Tax Rate'} />

            <Wrapper>
                <PageHeader
                    title={isEditing ? 'Edit Tax Rate' : 'Create Tax Rate'}
                    description={
                        isEditing
                            ? `Update details for ${taxRate.name}`
                            : 'Create a new tax rate'
                    }
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/ecommerce/tax-rates')
                            }
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Tax Rates
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={
                        isEditing
                            ? `/admin/ecommerce/tax-rates/${taxRate.id}`
                            : '/admin/ecommerce/tax-rates'
                    }
                    method={isEditing ? 'put' : 'post'}
                    id={formId}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="Standard VAT"
                                    defaultValue={taxRate?.name}
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
                                    defaultValue={taxRate?.rate}
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
                                    defaultValue={taxRate?.country_code ?? ''}
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
                                        defaultChecked={
                                            taxRate?.is_active ?? true
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="font-normal"
                                    >
                                        Active
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        name="is_default"
                                        value="1"
                                        defaultChecked={
                                            taxRate?.is_default ?? false
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_default"
                                        className="font-normal"
                                    >
                                        Default tax rate
                                    </Label>
                                </div>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={isEditing ? 'Save Changes' : 'Create Tax Rate'}
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
