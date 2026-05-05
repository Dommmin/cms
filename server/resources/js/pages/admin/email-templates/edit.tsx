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
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EditProps } from './edit.types';

export default function EmailTemplatesEdit({ template }: EditProps) {
    const __ = useTranslation();
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
            <Head title={`${__('action.edit', 'Edit')}: ${template.name}`} />
            <Wrapper>
                <PageHeader
                    title={template.name}
                    description={
                        template.description ??
                        __(
                            'email_template.edit_description',
                            'Edit the email template content and subject.',
                        )
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
                                {__(
                                    'email_template.back_to_templates',
                                    'Back to Templates',
                                )}
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
                        {template.is_active
                            ? __('status.active', 'Active')
                            : __('status.inactive', 'Inactive')}
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
                                            {__(
                                                'email_template.field_subject',
                                                'Subject',
                                            )}{' '}
                                            *
                                        </Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            required
                                            defaultValue={template.subject}
                                            placeholder={__(
                                                'email_template.subject_placeholder',
                                                'Email subject line',
                                            )}
                                        />
                                        <InputError message={errors.subject} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="body">
                                                {__(
                                                    'email_template.field_body',
                                                    'Body (HTML)',
                                                )}{' '}
                                                *
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
                                                        {__(
                                                            'email_template.hide_preview',
                                                            'Hide Preview',
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeIcon className="mr-1 h-4 w-4" />
                                                        {__(
                                                            'email_template.preview',
                                                            'Preview',
                                                        )}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="body"
                                            name="body"
                                            required
                                            defaultValue={template.body}
                                            placeholder={__(
                                                'email_template.body_placeholder',
                                                'Enter HTML content...',
                                            )}
                                            rows={20}
                                            className="font-mono text-sm"
                                        />
                                        <InputError message={errors.body} />
                                    </div>

                                    {showPreview && (
                                        <div className="rounded-lg border bg-white p-4">
                                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                {__(
                                                    'email_template.preview_label',
                                                    'HTML Preview (uses saved content)',
                                                )}
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
                                            {__(
                                                'email_template.active_label',
                                                'Active (template is used when sending emails)',
                                            )}
                                        </Label>
                                    </div>

                                    <StickyFormActions
                                        formId={formId}
                                        processing={processing}
                                        submitLabel={__(
                                            'action.save_changes',
                                            'Save Changes',
                                        )}
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
                                        {__(
                                            'email_template.available_variables',
                                            'Available Variables',
                                        )}
                                    </h3>
                                    <p className="mb-3 text-xs text-muted-foreground">
                                        {__(
                                            'email_template.variables_hint',
                                            'Click a variable to copy it to your clipboard.',
                                        )}
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
                            <h3 className="mb-2 text-sm font-semibold">
                                {__('email_template.tips_title', 'Tips')}
                            </h3>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>
                                    {__(
                                        'email_template.tip_variables',
                                        'Use variables in both the subject line and body.',
                                    )}
                                </li>
                                <li>
                                    {__(
                                        'email_template.tip_replacement',
                                        'Variables are replaced with real values when the email is sent.',
                                    )}
                                </li>
                                <li>
                                    {__(
                                        'email_template.tip_html',
                                        'The body must be valid HTML for proper email rendering.',
                                    )}
                                </li>
                                <li>
                                    {__(
                                        'email_template.tip_css',
                                        'Inline CSS is recommended for best email client compatibility.',
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
