import { Form, Head, router } from '@inertiajs/react';
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

type Currency = {
    id: number;
    code: string;
    name: string;
};

type Props = {
    currencies: Currency[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exchange Rates', href: '/admin/exchange-rates' },
    { title: 'Add', href: '/admin/exchange-rates/create' },
];

export default function Create({ currencies }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Exchange Rate" />
            <Wrapper>
                <PageHeader
                    title="Add Exchange Rate"
                    description="Add a new exchange rate"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/exchange-rates')
                            }
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action="/admin/exchange-rates"
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="currency_id">Currency *</Label>
                                <Select name="currency_id" required>
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
                                    placeholder="e.g., 4.123456"
                                />
                                <InputError message={errors.rate} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="source">Source</Label>
                                <Input
                                    id="source"
                                    name="source"
                                    placeholder="e.g., NBP, manual"
                                />
                                <InputError message={errors.source} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fetched_at">Fetched At</Label>
                                <Input
                                    id="fetched_at"
                                    name="fetched_at"
                                    type="datetime-local"
                                    defaultValue={new Date()
                                        .toISOString()
                                        .slice(0, 16)}
                                />
                                <InputError message={errors.fetched_at} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Adding...' : 'Add Rate'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
