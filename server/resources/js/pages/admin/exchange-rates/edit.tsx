import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
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
import type { Currency, ExchangeRate, EditProps } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exchange Rates', href: '/admin/exchange-rates' },
    { title: 'Edit', href: '' },
];

export default function Edit({ rate, currencies }: EditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Exchange Rate" />
            <Wrapper>
                <PageHeader
                    title="Edit Exchange Rate"
                    description="Update exchange rate"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/exchange-rates"
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={`/admin/exchange-rates/${rate.id}`}
                    method="post"
                    className="max-w-2xl space-y-6"
                    children={({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="grid gap-2">
                                <Label htmlFor="currency_id">Currency *</Label>
                                <Select
                                    name="currency_id"
                                    defaultValue={String(rate.currency_id)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((currency) => (
                                            <SelectItem
                                                key={currency.id}
                                                value={String(currency.id)}
                                            >
                                                {currency.code} -{' '}
                                                {currency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.currency_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="rate">Rate *</Label>
                                <Input
                                    id="rate"
                                    name="rate"
                                    type="number"
                                    step="0.000001"
                                    min="0"
                                    required
                                    defaultValue={rate.rate}
                                />
                                <InputError message={errors.rate} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="source">Source</Label>
                                <Input
                                    id="source"
                                    name="source"
                                    defaultValue={rate.source ?? ''}
                                    placeholder="e.g., NBP, manual"
                                />
                                <InputError message={errors.source} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fetched_at">Fetched At *</Label>
                                <Input
                                    id="fetched_at"
                                    name="fetched_at"
                                    type="datetime-local"
                                    defaultValue={rate.fetched_at.slice(0, 16)}
                                />
                                <InputError message={errors.fetched_at} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                />
            </Wrapper>
        </AppLayout>
    );
}
