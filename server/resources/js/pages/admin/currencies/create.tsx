import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as CurrencyController from '@/actions/App/Http/Controllers/Admin/CurrencyController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Currencies', href: CurrencyController.index.url() },
    { title: 'Create', href: CurrencyController.create.url() },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Currency" />
            <Wrapper>
                <PageHeader
                    title="Add Currency"
                    description="Add a new currency"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={CurrencyController.index.url()}
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
                    action={CurrencyController.store.url()}
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Currency Code *</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    required
                                    maxLength={3}
                                    placeholder="e.g., USD"
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="e.g., US Dollar"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="symbol">Symbol *</Label>
                                <Input
                                    id="symbol"
                                    name="symbol"
                                    required
                                    placeholder="e.g., $"
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
                                    defaultValue="2"
                                    required
                                />
                                <InputError message={errors.decimal_places} />
                            </div>

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
                                        Base currency
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
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
                                    {processing ? 'Adding...' : 'Add Currency'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
