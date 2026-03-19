import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon, StarIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ExchangeRate = {
    rate: number;
    fetched_at: string;
};

type Currency = {
    id: number;
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    is_active: boolean;
    is_base: boolean;
    exchange_rates: ExchangeRate[];
};

type Props = {
    currency: Currency;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Currencies', href: '/admin/currencies' },
    { title: 'Edit', href: '' },
];

export default function Edit({ currency }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${currency.code}`} />
            <Wrapper>
                <PageHeader
                    title="Edit Currency"
                    description="Update currency settings"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/currencies"
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mb-4 flex items-center gap-2">
                    {currency.is_base && (
                        <Badge variant="outline">
                            <StarIcon className="mr-1 h-3 w-3" />
                            Base Currency
                        </Badge>
                    )}
                    <Badge
                        variant={currency.is_active ? 'default' : 'secondary'}
                    >
                        {currency.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <Form
                    action={`/admin/currencies/${currency.id}`}
                    method="post"
                    className="max-w-2xl space-y-6"
                    children={({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="grid gap-2">
                                <Label htmlFor="code">Currency Code *</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    required
                                    maxLength={3}
                                    defaultValue={currency.code}
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={currency.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="symbol">Symbol *</Label>
                                <Input
                                    id="symbol"
                                    name="symbol"
                                    required
                                    defaultValue={currency.symbol}
                                />
                                <InputError message={errors.symbol} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="decimal_places">
                                    Decimal Places *
                                </Label>
                                <Input
                                    id="decimal_places"
                                    name="decimal_places"
                                    type="number"
                                    min="0"
                                    max="4"
                                    defaultValue={String(
                                        currency.decimal_places,
                                    )}
                                    required
                                />
                                <InputError message={errors.decimal_places} />
                            </div>

                            {!currency.is_base && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_base"
                                            name="is_base"
                                            value="1"
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label
                                            htmlFor="is_base"
                                            className="font-normal"
                                        >
                                            Set as base currency
                                        </Label>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={currency.is_active}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Active
                                </Label>
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
