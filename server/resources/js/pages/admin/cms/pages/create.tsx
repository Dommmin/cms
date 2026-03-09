import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';

type ModuleConfig = {
    label: string;
    description?: string;
};

type Props = {
    modules: Record<string, ModuleConfig>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pages', href: '/admin/cms/pages' },
    { title: 'Create', href: '/admin/cms/pages/create' },
];

export default function Create({ modules }: Props) {
    const moduleOptions = useMemo(
        () => Object.entries(modules ?? {}),
        [modules],
    );

    const [layout, setLayout] = useState<string>('default');
    const [pageType, setPageType] = useState<string>('blocks');
    const [moduleName, setModuleName] = useState<string | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Page" />

            <Wrapper>
                <PageHeader
                    title="Create Page"
                    description="Add a new CMS page"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/admin/cms/pages')}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Pages
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action="/admin/cms/pages"
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="layout" value={layout} />
                            <input
                                type="hidden"
                                name="page_type"
                                value={pageType}
                            />
                            <input
                                type="hidden"
                                name="module_name"
                                value={moduleName ?? ''}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    autoFocus
                                    placeholder="Page title"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    placeholder="page-slug"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    name="excerpt"
                                    placeholder="Short description..."
                                />
                                <InputError message={errors.excerpt} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Layout</Label>
                                <Select
                                    value={layout}
                                    onValueChange={setLayout}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select layout" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">
                                            Standard
                                        </SelectItem>
                                        <SelectItem value="full_width">
                                            Full width
                                        </SelectItem>
                                        <SelectItem value="sidebar">
                                            Sidebar
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.layout} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Page type</Label>
                                <Select
                                    value={pageType}
                                    onValueChange={(value) => {
                                        setPageType(value);
                                        if (value !== 'module') {
                                            setModuleName(null);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select page type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="blocks">
                                            Blocks
                                        </SelectItem>
                                        <SelectItem value="module">
                                            Module
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.page_type} />
                            </div>

                            {pageType === 'module' && (
                                <div className="grid gap-2">
                                    <Label>Module</Label>
                                    <Select
                                        value={moduleName ?? ''}
                                        onValueChange={(value) =>
                                            setModuleName(
                                                value === '' ? null : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {moduleOptions.map(([key, mod]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {mod.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.module_name} />
                                </div>
                            )}

                            {pageType === 'module' &&
                                moduleName === 'content' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="content_id">
                                            Content entry ID
                                        </Label>
                                        <Input
                                            id="content_id"
                                            name="module_config[content_id]"
                                            type="number"
                                            placeholder="e.g. 1"
                                        />
                                        <InputError
                                            message={
                                                (errors as any)[
                                                    'module_config.content_id'
                                                ]
                                            }
                                        />
                                    </div>
                                )}

                            {pageType === 'module' && moduleName === 'faq' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="category">
                                        FAQ category (optional)
                                    </Label>
                                    <Input
                                        id="category"
                                        name="module_config[category]"
                                        placeholder="e.g. payments"
                                    />
                                    <InputError
                                        message={
                                            (errors as any)[
                                                'module_config.category'
                                            ]
                                        }
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="seo_title">SEO title</Label>
                                <Input
                                    id="seo_title"
                                    name="seo_title"
                                    placeholder="SEO title"
                                />
                                <InputError message={errors.seo_title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="seo_description">
                                    SEO description
                                </Label>
                                <Textarea
                                    id="seo_description"
                                    name="seo_description"
                                    placeholder="SEO description"
                                />
                                <InputError message={errors.seo_description} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="seo_canonical">
                                    Canonical URL
                                </Label>
                                <Input
                                    id="seo_canonical"
                                    name="seo_canonical"
                                    placeholder="https://..."
                                />
                                <InputError message={errors.seo_canonical} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Page'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
