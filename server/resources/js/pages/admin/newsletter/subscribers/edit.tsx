import { Link, Form, Head } from '@inertiajs/react';
import * as NewsletterSubscriberController from '@/actions/App/Http/Controllers/Admin/NewsletterSubscriberController';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Subscriber } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: NewsletterSubscriberController.index.url() },
    { title: 'Subscribers', href: NewsletterSubscriberController.index.url() },
    { title: 'Edit', href: '#' },
];

export default function Edit({ subscriber }: { subscriber: Subscriber }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${subscriber.email}`} />
            <Wrapper>
                <PageHeader
                    title="Edit Subscriber"
                    description={subscriber.email}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={NewsletterSubscriberController.index.url()}
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
                    action={NewsletterSubscriberController.update.url(subscriber.id)}
                    method="put"
                    options={{ preserveScroll: true }}
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={subscriber.email}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    defaultValue={subscriber.first_name ?? ''}
                                    placeholder="First name"
                                />
                                <InputError message={errors.first_name} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={subscriber.is_active}
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
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
