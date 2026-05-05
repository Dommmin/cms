import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import * as WebhookController from '@/actions/App/Http/Controllers/Admin/WebhookController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FormProps, WebhookFormData } from './form.types';

export default function EditWebhook({ webhook, available_events }: FormProps) {
    const __ = useTranslation();
    const [showSecret, setShowSecret] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Webhooks', href: WebhookController.index.url() },
        { title: webhook!.name, href: '' },
    ];

    const { data, setData, patch, processing, errors } =
        useForm<WebhookFormData>({
            name: webhook!.name,
            url: webhook!.url,
            description: webhook!.description ?? '',
            events: webhook!.events,
            is_active: webhook!.is_active,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(WebhookController.update.url(webhook!.id));
    };

    const toggleEvent = (event: string) => {
        setData(
            'events',
            data.events.includes(event)
                ? data.events.filter((e) => e !== event)
                : [...data.events, event],
        );
    };

    const maskedSecret = webhook!.secret.slice(0, 8) + '•'.repeat(24);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${__('webhook.edit_title', 'Edit Webhook')} — ${webhook!.name}`}
            />
            <Wrapper>
                <PageHeader
                    title={`${__('webhook.edit_title', 'Edit Webhook')}: ${webhook!.name}`}
                    description={__(
                        'webhook.edit_description',
                        'Update the webhook configuration.',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={WebhookController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            {__('webhook.field_name', 'Name')} *
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={__(
                                'webhook.name_placeholder',
                                'e.g. Order Notifications',
                            )}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="url">
                            {__('webhook.field_url', 'URL')} *
                        </Label>
                        <Input
                            id="url"
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder={__(
                                'webhook.url_placeholder',
                                'https://example.com/webhook',
                            )}
                        />
                        <InputError message={errors.url} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            {__('webhook.field_description', 'Description')}
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder={__(
                                'webhook.description_placeholder',
                                'Optional description',
                            )}
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label>
                            {__('webhook.signing_secret', 'Signing Secret')}
                        </Label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                                {showSecret ? webhook!.secret : maskedSecret}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSecret((v) => !v)}
                            >
                                <EyeOffIcon className="h-4 w-4" />
                                {showSecret
                                    ? __('action.hide', 'Hide')
                                    : __('action.show', 'Show')}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {__(
                                'webhook.signing_secret_hint',
                                'Use this secret to verify webhook signatures (',
                            )}
                            <Badge
                                variant="outline"
                                className="font-mono text-xs"
                            >
                                X-Webhook-Signature: sha256=...
                            </Badge>
                            ).
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label>{__('webhook.events', 'Events')} *</Label>
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
                            {__(
                                'webhook.active_label',
                                'Active (webhook will receive events)',
                            )}
                        </Label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing
                            ? __('action.saving', 'Saving...')
                            : __('action.save_changes', 'Save Changes')}
                    </Button>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
