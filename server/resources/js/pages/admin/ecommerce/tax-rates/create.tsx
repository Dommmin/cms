import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import * as TaxRateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/TaxRateController';
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
    const __ = useTranslation();
    const isEditing = !!taxRate;
    const formId = isEditing ? 'tax-rate-edit-form' : 'tax-rate-create-form';
    const [countryCode, setCountryCode] = useState(taxRate?.country_code ?? '');
    const breadcrumbs: BreadcrumbItem[] = isEditing
        ? [
              {
                  title: 'Tax Rates',
                  href: TaxRateController.index.url(),
              },
              {
                  title: 'Edit Tax Rate',
                  href: TaxRateController.edit.url(taxRate.id),
              },
          ]
        : [
              {
                  title: 'Tax Rates',
                  href: TaxRateController.index.url(),
              },
              {
                  title: 'Create Tax Rate',
                  href: TaxRateController.create.url(),
              },
          ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Tax Rate' : 'Create Tax Rate'} />

            <Wrapper>
                <PageHeader
                    title={
                        isEditing
                            ? __('page.edit_tax_rate', 'Edit Tax Rate')
                            : __('page.create_tax_rate', 'Create Tax Rate')
                    }
                    description={
                        isEditing
                            ? `Update details for ${taxRate.name}`
                            : __(
                                  'page.create_tax_rate_desc',
                                  'Create a new tax rate',
                              )
                    }
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
                    action={
                        isEditing
                            ? TaxRateController.update.url(taxRate.id)
                            : TaxRateController.store.url()
                    }
                    method={isEditing ? 'put' : 'post'}
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
                                    defaultValue={taxRate?.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="rate">
                                    {__('label.rate_pct', 'Rate (%)')}
                                </Label>
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
                                    {__('label.country', 'Country (optional)')}
                                </Label>
                                <Select
                                    value={countryCode || 'all'}
                                    onValueChange={(v) =>
                                        setCountryCode(v === 'all' ? '' : v)
                                    }
                                >
                                    <SelectTrigger id="country_code">
                                        <SelectValue placeholder="All countries" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All countries
                                        </SelectItem>
                                        {COMMON_COUNTRIES.map((country) => (
                                            <SelectItem
                                                key={country.code}
                                                value={country.code}
                                            >
                                                {country.name} ({country.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="country_code"
                                    value={countryCode}
                                />
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
                                        {__('label.is_active', 'Active')}
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
                                submitLabel={
                                    isEditing
                                        ? __(
                                              'action.save_changes',
                                              'Save Changes',
                                          )
                                        : __(
                                              'action.create_tax_rate',
                                              'Create Tax Rate',
                                          )
                                }
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
