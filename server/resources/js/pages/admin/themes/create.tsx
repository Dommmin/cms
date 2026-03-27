import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as ThemeController from '@/actions/App/Http/Controllers/Admin/ThemeController';
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
    { title: 'Themes', href: ThemeController.index.url() },
    { title: 'Create', href: ThemeController.create.url() },
];

const editableTokens = [
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Foreground' },
    { key: 'primary', label: 'Primary' },
    { key: 'primary-foreground', label: 'Primary Foreground' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'secondary-foreground', label: 'Secondary Foreground' },
    { key: 'muted', label: 'Muted' },
    { key: 'muted-foreground', label: 'Muted Foreground' },
    { key: 'accent', label: 'Accent' },
    { key: 'accent-foreground', label: 'Accent Foreground' },
    { key: 'border', label: 'Border' },
    { key: 'ring', label: 'Ring' },
    { key: 'radius', label: 'Radius' },
    { key: 'sidebar', label: 'Sidebar' },
    { key: 'sidebar-foreground', label: 'Sidebar Foreground' },
    { key: 'sidebar-primary', label: 'Sidebar Primary' },
    {
        key: 'sidebar-primary-foreground',
        label: 'Sidebar Primary Foreground',
    },
    { key: 'sidebar-accent', label: 'Sidebar Accent' },
    { key: 'sidebar-accent-foreground', label: 'Sidebar Accent Foreground' },
    { key: 'sidebar-border', label: 'Sidebar Border' },
    { key: 'sidebar-ring', label: 'Sidebar Ring' },
] as const;

export default function Create() {
    const formId = 'theme-create-form';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Theme" />
            <Wrapper>
                <PageHeader
                    title="Create Theme"
                    description="Add a new visual theme"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ThemeController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Themes
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={ThemeController.store.url()}
                    method="post"
                    id={formId}
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="e.g., Modern Dark"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    placeholder="e.g., modern-dark"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Theme description..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="rounded-lg border p-4">
                                <h3 className="mb-3 text-sm font-semibold">
                                    Theme Tokens
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {editableTokens.map((token) => (
                                        <div
                                            key={token.key}
                                            className="grid gap-2"
                                        >
                                            <Label
                                                htmlFor={`token-${token.key}`}
                                            >
                                                {token.label}
                                            </Label>
                                            <Input
                                                id={`token-${token.key}`}
                                                name={`tokens[${token.key}]`}
                                                placeholder="e.g. oklch(0.205 0 0) or #111827"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.tokens} />
                            </div>

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
                                    defaultChecked
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Active
                                </Label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel="Create Theme"
                                processingLabel="Creating..."
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
