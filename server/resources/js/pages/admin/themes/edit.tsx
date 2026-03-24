import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
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
import type { Theme, EditProps } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Themes', href: '/admin/themes' },
    { title: 'Edit', href: '' },
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

export default function Edit({ theme }: EditProps) {
    const formId = 'theme-edit-form';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${theme.name}`} />
            <Wrapper>
                <PageHeader
                    title="Edit Theme"
                    description="Update theme settings"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/themes" prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Themes
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mb-4 flex items-center gap-2">
                    <Badge variant={theme.is_active ? 'default' : 'secondary'}>
                        {theme.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Used by {theme.pages_count} pages
                    </span>
                </div>

                <Form
                    action={`/admin/themes/${theme.id}`}
                    method="post"
                    id={formId}
                    className="max-w-2xl space-y-6"
                    children={({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={theme.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    defaultValue={theme.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={theme.description ?? ''}
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
                                                defaultValue={
                                                    theme.tokens?.[token.key] ??
                                                    ''
                                                }
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
                                    defaultChecked={theme.is_active}
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
                                submitLabel="Save Changes"
                            />
                        </>
                    )}
                />
            </Wrapper>
        </AppLayout>
    );
}
