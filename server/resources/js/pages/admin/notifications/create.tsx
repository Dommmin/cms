import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as AppNotificationController from '@/actions/App/Http/Controllers/Admin/AppNotificationController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { CreateProps } from './create.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: AppNotificationController.index.url() },
    { title: 'Create', href: AppNotificationController.create.url() },
];

export default function CreateNotification({
    customers,
    types,
    channels,
}: CreateProps) {
    const formId = 'notification-create-form';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Notification" />
            <Wrapper>
                <PageHeader
                    title="Create Notification"
                    description="Create and queue a manual notification"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={AppNotificationController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Notifications
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={AppNotificationController.store.url()}
                    method="post"
                    id={formId}
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="customer_id">Customer *</Label>
                                <select
                                    id="customer_id"
                                    name="customer_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                    required
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Select customer
                                    </option>
                                    {customers.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {[
                                                customer.first_name,
                                                customer.last_name,
                                            ]
                                                .filter(Boolean)
                                                .join(' ') ||
                                                customer.email}{' '}
                                            ({customer.email})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.customer_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">Type *</Label>
                                <select
                                    id="type"
                                    name="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                    required
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Select type
                                    </option>
                                    {types.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="channel">Channel *</Label>
                                <select
                                    id="channel"
                                    name="channel"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                    required
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Select channel
                                    </option>
                                    {channels.map((channel) => (
                                        <option
                                            key={channel.value}
                                            value={channel.value}
                                        >
                                            {channel.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.channel} />
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel="Create Notification"
                                processingLabel="Creating..."
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
