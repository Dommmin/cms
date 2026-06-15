import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import * as AppNotificationController from '@/actions/App/Http/Controllers/Admin/AppNotificationController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
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
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('');
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
                                <Select
                                    value={selectedCustomer}
                                    onValueChange={setSelectedCustomer}
                                >
                                    <SelectTrigger id="customer_id">
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem
                                                key={customer.id}
                                                value={customer.id.toString()}
                                            >
                                                {[
                                                    customer.first_name,
                                                    customer.last_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ') ||
                                                    customer.email}{' '}
                                                ({customer.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="customer_id"
                                    value={selectedCustomer}
                                />
                                <InputError message={errors.customer_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={selectedType}
                                    onValueChange={setSelectedType}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((type) => (
                                            <SelectItem
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="type"
                                    value={selectedType}
                                />
                                <InputError message={errors.type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="channel">Channel *</Label>
                                <Select
                                    value={selectedChannel}
                                    onValueChange={setSelectedChannel}
                                >
                                    <SelectTrigger id="channel">
                                        <SelectValue placeholder="Select channel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {channels.map((channel) => (
                                            <SelectItem
                                                key={channel.value}
                                                value={channel.value}
                                            >
                                                {channel.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="channel"
                                    value={selectedChannel}
                                />
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
