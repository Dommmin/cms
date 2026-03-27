import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as NewsletterCampaignController from '@/actions/App/Http/Controllers/Admin/NewsletterCampaignController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { CreateProps } from './create.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: NewsletterCampaignController.index.url() },
    { title: 'Campaigns', href: NewsletterCampaignController.index.url() },
    { title: 'Create', href: NewsletterCampaignController.create.url() },
];

export default function Create({ segments }: CreateProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Campaign" />
            <Wrapper>
                <PageHeader
                    title="Create Campaign"
                    description="Draft a new email campaign"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={NewsletterCampaignController.index.url()}
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
                    action={NewsletterCampaignController.store.url()}
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Basic info */}
                            <div className="rounded-lg border bg-card p-6">
                                <h3 className="mb-4 font-medium">
                                    Campaign Info
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Campaign Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="e.g., March Newsletter"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type *</Label>
                                        <select
                                            id="type"
                                            name="type"
                                            required
                                            defaultValue="regular"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        >
                                            <option value="regular">
                                                Regular
                                            </option>
                                            <option value="automated">
                                                Automated
                                            </option>
                                            <option value="ab_test">
                                                A/B Test
                                            </option>
                                        </select>
                                        <InputError message={errors.type} />
                                    </div>
                                </div>
                            </div>

                            {/* Email settings */}
                            <div className="rounded-lg border bg-card p-6">
                                <h3 className="mb-4 font-medium">Email</h3>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="subject">
                                            Subject Line *
                                        </Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            required
                                            placeholder="Your email subject"
                                        />
                                        <InputError message={errors.subject} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="preview_text">
                                            Preview Text
                                        </Label>
                                        <Input
                                            id="preview_text"
                                            name="preview_text"
                                            placeholder="Short preview shown in inbox"
                                        />
                                        <InputError
                                            message={errors.preview_text}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="sender_name">
                                                Sender Name
                                            </Label>
                                            <Input
                                                id="sender_name"
                                                name="sender_name"
                                                placeholder="Your Name"
                                            />
                                            <InputError
                                                message={errors.sender_name}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="sender_email">
                                                Sender Email
                                            </Label>
                                            <Input
                                                id="sender_email"
                                                name="sender_email"
                                                type="email"
                                                placeholder="noreply@example.com"
                                            />
                                            <InputError
                                                message={errors.sender_email}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="html_content">
                                            HTML Content *
                                        </Label>
                                        <Textarea
                                            id="html_content"
                                            name="html_content"
                                            required
                                            rows={10}
                                            placeholder="<p>Your email HTML content...</p>"
                                            className="font-mono text-xs"
                                        />
                                        <InputError
                                            message={errors.html_content}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="plain_text_content">
                                            Plain Text Version
                                        </Label>
                                        <Textarea
                                            id="plain_text_content"
                                            name="plain_text_content"
                                            rows={4}
                                            placeholder="Plain text version of your email..."
                                        />
                                        <InputError
                                            message={errors.plain_text_content}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Audience */}
                            <div className="rounded-lg border bg-card p-6">
                                <h3 className="mb-4 font-medium">Audience</h3>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="audience_type">
                                            Send To *
                                        </Label>
                                        <select
                                            id="audience_type"
                                            name="audience_type"
                                            required
                                            defaultValue="all"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        >
                                            <option value="all">
                                                All Subscribers
                                            </option>
                                            <option value="segment">
                                                Specific Segment
                                            </option>
                                        </select>
                                        <InputError
                                            message={errors.audience_type}
                                        />
                                    </div>

                                    {segments.length > 0 && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="newsletter_segment_id">
                                                Segment
                                            </Label>
                                            <select
                                                id="newsletter_segment_id"
                                                name="newsletter_segment_id"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            >
                                                <option value="">
                                                    — No segment —
                                                </option>
                                                {segments.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.id}
                                                    >
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={
                                                    errors.newsletter_segment_id
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Campaign'}
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Campaign will be saved as Draft
                                </p>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
