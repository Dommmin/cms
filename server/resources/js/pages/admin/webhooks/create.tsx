import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as WebhookController from '@/actions/App/Http/Controllers/Admin/WebhookController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FormProps, WebhookFormData } from './form.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Webhooks', href: WebhookController.index.url() },
    { title: 'Create', href: '' },
];

export default function CreateWebhook({ available_events }: FormProps) {
    const { data, setData, post, processing, errors } =
        useForm<WebhookFormData>({
            name: '',
            url: '',
            description: '',
            events: [],
            is_active: true,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(WebhookController.store.url());
    };

    const toggleEvent = (event: string) => {
        setData(
            'events',
            data.events.includes(event)
                ? data.events.filter((e) => e !== event)
                : [...data.events, event],
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Webhook" />
            <Wrapper>
                <PageHeader
                    title="Create Webhook"
                    description="Configure a new outgoing webhook endpoint."
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={WebhookController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-2xl space-y-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Order Notifications"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="url">URL *</Label>
                        <Input
                            id="url"
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="https://example.com/webhook"
                        />
                        <InputError message={errors.url} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Optional description"
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Events *</Label>
                        <div className="space-y-2 rounded-md border p-3">
                            {available_events.map((event) => (
                                <div
                                    key={event}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        id={`event-${event}`}
                                        checked={data.events.includes(event)}
                                        onChange={() => toggleEvent(event)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label
                                        htmlFor={`event-${event}`}
                                        className="cursor-pointer font-mono text-sm font-normal"
                                    >
                                        {event}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.events} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Active (webhook will receive events)
                        </Label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Webhook'}
                    </Button>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
