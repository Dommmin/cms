import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Support', href: '/admin/support' },
    { title: 'Canned Responses', href: '/admin/support/canned-responses' },
    { title: 'Create', href: '/admin/support/canned-responses/create' },
];

export default function CreateCannedResponse() {
    const formId = 'canned-response-create-form';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Canned Response" />
            <Wrapper>
                <PageHeader
                    title="Create Canned Response"
                    description="Add a predefined reply for agents"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/support/canned-responses"
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
                    action="/admin/support/canned-responses"
                    method="post"
                    id={formId}
                    className="max-w-2xl space-y-6"
                >
                    {({ errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Shipping information"
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shortcut">
                                    Shortcut *{' '}
                                    <span className="text-xs text-muted-foreground">
                                        (used as #shortcut in chat)
                                    </span>
                                </Label>
                                <div className="flex items-center">
                                    <span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                                        #
                                    </span>
                                    <Input
                                        id="shortcut"
                                        name="shortcut"
                                        placeholder="shipping"
                                        required
                                        className="rounded-l-none"
                                    />
                                </div>
                                <InputError message={errors.shortcut} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="body">Response body *</Label>
                                <Textarea
                                    id="body"
                                    name="body"
                                    placeholder="Type the full response text here..."
                                    rows={6}
                                    required
                                />
                                <InputError message={errors.body} />
                            </div>

                            <StickyFormActions formId={formId} />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
