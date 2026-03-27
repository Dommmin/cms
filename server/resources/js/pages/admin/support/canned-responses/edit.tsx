import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as SupportCannedResponseController from '@/actions/App/Http/Controllers/Admin/SupportCannedResponseController';
import * as SupportConversationController from '@/actions/App/Http/Controllers/Admin/SupportConversationController';
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
import type { EditProps } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Support', href: SupportConversationController.index.url() },
    {
        title: 'Canned Responses',
        href: SupportCannedResponseController.index.url(),
    },
    { title: 'Edit', href: '#' },
];

export default function EditCannedResponse({ canned_response }: EditProps) {
    const formId = 'canned-response-edit-form';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Canned Response" />
            <Wrapper>
                <PageHeader
                    title="Edit Canned Response"
                    description={`Editing: ${canned_response.title}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={SupportCannedResponseController.index.url()}
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
                    action={SupportCannedResponseController.update.url(
                        canned_response.id,
                    )}
                    method="put"
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
                                    defaultValue={canned_response.title}
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
                                        defaultValue={canned_response.shortcut}
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
                                    defaultValue={canned_response.body}
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
