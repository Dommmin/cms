import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as FormController from '@/actions/App/Http/Controllers/Admin/FormController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forms', href: FormController.index.url() },
    { title: 'Create', href: FormController.create.url() },
];

export default function Create() {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Form" />

            <Wrapper>
                <PageHeader
                    title={__('page.create_form', 'Create Form')}
                    description={__('page.create_form_desc', 'Add a new form')}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={FormController.index.url()}
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
                    method="post"
                    action={FormController.store.url()}
                    className="max-w-xl space-y-6"
                >
                    {({ errors }) => (
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
                                    placeholder="Contact Form"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">
                                    {__('label.slug', 'Slug')}
                                </Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    placeholder="contact-form"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    {__('label.description', 'Description')}
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Form description..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notify_emails">
                                    {__(
                                        'label.notify_emails',
                                        'Notify Emails (one per line)',
                                    )}
                                </Label>
                                <Textarea
                                    id="notify_emails"
                                    name="notify_emails"
                                    placeholder="admin@example.com&#10;support@example.com"
                                    rows={3}
                                />
                                <InputError message={errors.notify_emails} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    {__('label.is_active', 'Active')}
                                </Label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button variant="outline" type="submit">
                                    {__('action.create_form', 'Create Form')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
