import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as CustomerController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CustomerController';
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
import type { CustomerEdit } from './edit.types';

export default function CustomerEditPage({ customer }: { customer: CustomerEdit }) {
    const __ = useTranslation();
    const formId = 'customer-edit-form';

    const fullName = `${customer.first_name} ${customer.last_name}`.trim();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('page.customers', 'Customers'),
            href: CustomerController.index.url(),
        },
        {
            title: fullName || customer.email,
            href: CustomerController.show.url(customer.id),
        },
        {
            title: __('action.edit', 'Edit'),
            href: CustomerController.edit.url(customer.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit — ${fullName || customer.email}`} />

            <Wrapper>
                <PageHeader
                    title={__('page.edit_customer', 'Edit Customer')}
                    description={fullName || customer.email}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={CustomerController.show.url(customer.id)}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={CustomerController.update.url(customer.id)}
                    method="put"
                    id={formId}
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">
                                        {__('label.first_name', 'First Name')}
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        required
                                        autoFocus
                                        defaultValue={customer.first_name}
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">
                                        {__('label.last_name', 'Last Name')}
                                    </Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        required
                                        defaultValue={customer.last_name}
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {__('label.email', 'Email')}
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={customer.email}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    {__('label.phone', 'Phone')}
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={customer.phone ?? ''}
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="company_name">
                                        {__('label.company_name', 'Company Name')}
                                    </Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        defaultValue={customer.company_name ?? ''}
                                    />
                                    <InputError message={errors.company_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tax_id">
                                        {__('label.tax_id', 'Tax ID (NIP)')}
                                    </Label>
                                    <Input
                                        id="tax_id"
                                        name="tax_id"
                                        defaultValue={customer.tax_id ?? ''}
                                    />
                                    <InputError message={errors.tax_id} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">
                                    {__('label.notes', 'Admin Notes')}
                                </Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    maxLength={5000}
                                    defaultValue={customer.notes ?? ''}
                                    placeholder={__('placeholder.notes', 'Internal notes about this customer...')}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={customer.is_active}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="is_active" className="font-normal">
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
