import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    ClipboardCopyIcon,
    EyeIcon,
    EyeOffIcon,
} from 'lucide-react';
import { useState } from 'react';
import * as EmailTemplateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/EmailTemplateController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EditProps } from './edit.types';

export default function EmailTemplatesEdit({ template }: EditProps) {
    const [showPreview, setShowPreview] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Email Templates',
            href: EmailTemplateController.index.url(),
        },
        { title: template.name, href: '' },
    ];

    const formId = 'email-template-edit-form';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${template.name}`} />
            <Wrapper>
                <PageHeader
                    title={template.name}
                    description={
                        template.description ??
                        'Edit the email template content and subject.'
                    }
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={EmailTemplateController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Templates
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mb-4 flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                        {template.key}
                    </span>
                    <Badge
                        variant={template.is_active ? 'default' : 'secondary'}
                    >
                        {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Form
                            action={EmailTemplateController.update.url(
                                template.id,
                            )}
                            method="post"
                            id={formId}
                            className="space-y-6"
                            children={({ processing, errors }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="_method"
                                        value="PUT"
                                    />

                                    <div className="grid gap-2">
                                        <Label htmlFor="subject">
                                            Subject *
                                        </Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            required
                                            defaultValue={template.subject}
                                            placeholder="Email subject line"
                                        />
                                        <InputError message={errors.subject} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="body">
                                                Body (HTML) *
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setShowPreview((v) => !v)
                                                }
                                            >
                                                {showPreview ? (
                                                    <>
                                                        <EyeOffIcon className="mr-1 h-4 w-4" />
                                                        Hide Preview
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeIcon className="mr-1 h-4 w-4" />
                                                        Preview
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="body"
                                            name="body"
                                            required
                                            defaultValue={template.body}
                                            placeholder="Enter HTML content..."
                                            rows={20}
                                            className="font-mono text-sm"
                                        />
                                        <InputError message={errors.body} />
                                    </div>

                                    {showPreview && (
                                        <div className="rounded-lg border bg-white p-4">
                                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                HTML Preview (uses saved
                                                content)
                                            </p>
                                            <div
                                                className="prose max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: template.body,
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="hidden"
                                            name="is_active"
                                            value="0"
                                        />
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            name="is_active"
                                            value="1"
                                            defaultChecked={template.is_active}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="font-normal"
                                        >
                                            Active (template is used when
                                            sending emails)
                                        </Label>
                                    </div>

                                    <StickyFormActions
                                        formId={formId}
                                        processing={processing}
                                        submitLabel="Save Changes"
                                    />
                                </>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        {template.variables &&
                            template.variables.length > 0 && (
                                <div className="rounded-lg border p-4">
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Available Variables
                                    </h3>
                                    <p className="mb-3 text-xs text-muted-foreground">
                                        Click a variable to copy it to your
                                        clipboard.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {template.variables.map((variable) => (
                                            <button
                                                key={variable}
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        variable,
                                                    );
                                                }}
                                                className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono text-xs transition-colors hover:bg-muted/70"
                                                title={`Click to copy ${variable}`}
                                            >
                                                <ClipboardCopyIcon className="h-3 w-3" />
                                                {variable}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        <div className="rounded-lg border p-4">
                            <h3 className="mb-2 text-sm font-semibold">Tips</h3>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>
                                    Use variables in both the subject line and
                                    body.
                                </li>
                                <li>
                                    Variables are replaced with real values when
                                    the email is sent.
                                </li>
                                <li>
                                    The body must be valid HTML for proper email
                                    rendering.
                                </li>
                                <li>
                                    Inline CSS is recommended for best email
                                    client compatibility.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
