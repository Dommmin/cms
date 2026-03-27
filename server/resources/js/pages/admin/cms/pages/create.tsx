import { Link, Form, Head, usePage } from '@inertiajs/react';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';

import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { CreateProps } from './create.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pages', href: PageController.index.url() },
    { title: 'Create', href: PageController.create.url() },
];

export default function Create({ modules, pages }: CreateProps) {
    const __ = useTranslation();
    const { locales } = usePage().props as { locales: SharedLocale[] };

    const moduleOptions = useMemo(
        () => Object.entries(modules ?? {}),
        [modules],
    );

    const [layout, setLayout] = useState<string>('default');
    const [pageType, setPageType] = useState<string>('blocks');
    const [moduleName, setModuleName] = useState<string | null>(null);
    const [locale, setLocale] = useState<string>('global');
    const [parentId, setParentId] = useState<string>('none');
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [isSlugManual, setIsSlugManual] = useState(false);

    const handleTitleChange = (value: string) => {
        setTitle(value);
        if (!isSlugManual) {
            setSlug(slugify(value));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Page" />

            <Wrapper>
                <PageHeader
                    title={__('page.create_page', 'Create Page')}
                    description={__(
                        'page.create_page_desc',
                        'Add a new CMS page',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={PageController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={PageController.store.url()}
                    method="post"
                    className="max-w-2xl"
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
                            {locale !== 'global' && (
                                <input
                                    type="hidden"
                                    name="locale"
                                    value={locale}
                                />
                            )}
                            {parentId !== 'none' && (
                                <input
                                    type="hidden"
                                    name="parent_id"
                                    value={parentId}
                                />
                            )}

                            <Tabs defaultValue="general" className="space-y-6">
                                <TabsList>
                                    <TabsTrigger value="general">
                                        {__('tab.general', 'General')}
                                    </TabsTrigger>
                                    <TabsTrigger value="seo">
                                        {__('tab.seo', 'SEO')}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="general"
                                    className="space-y-6"
                                >
                                    {locales.length > 0 && (
                                        <div className="grid gap-2">
                                            <Label>
                                                {__(
                                                    'label.site',
                                                    'Site / Locale',
                                                )}
                                            </Label>
                                            <Select
                                                value={locale}
                                                onValueChange={setLocale}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="global">
                                                        — Global (no locale) —
                                                    </SelectItem>
                                                    {locales.map((l) => (
                                                        <SelectItem
                                                            key={l.code}
                                                            value={l.code}
                                                        >
                                                            {l.name} ({l.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    (errors as any).locale
                                                }
                                            />
                                        </div>
                                    )}

                                    {pages.length > 0 && (
                                        <div className="grid gap-2">
                                            <Label>
                                                {__(
                                                    'label.parent_page',
                                                    'Parent page',
                                                )}
                                            </Label>
                                            <Select
                                                value={parentId}
                                                onValueChange={setParentId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="No parent (top-level)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        — No parent (top-level)
                                                        —
                                                    </SelectItem>
                                                    {pages.map((p) => (
                                                        <SelectItem
                                                            key={p.id}
                                                            value={String(p.id)}
                                                        >
                                                            /{p.slug}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    (errors as any).parent_id
                                                }
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="title">
                                            {__('label.title', 'Title')}
                                        </Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                            autoFocus
                                            placeholder="Page title"
                                            value={title}
                                            onChange={(e) =>
                                                handleTitleChange(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">
                                            {__('label.slug', 'Slug')}
                                        </Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            required
                                            placeholder="page-slug"
                                            value={slug}
                                            readOnly={!isSlugManual}
                                            onChange={(e) =>
                                                setSlug(slugify(e.target.value))
                                            }
                                        />
                                        <InputError message={errors.slug} />
                                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <input
                                                type="checkbox"
                                                checked={isSlugManual}
                                                onChange={(e) => {
                                                    const manual =
                                                        e.target.checked;
                                                    setIsSlugManual(manual);
                                                    if (!manual) {
                                                        setSlug(slugify(title));
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-input"
                                            />
                                            {__(
                                                'misc.slug_auto_hint',
                                                'Set slug manually',
                                            )}
                                        </label>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="excerpt">
                                            {__('label.excerpt', 'Excerpt')}
                                        </Label>
                                        <Textarea
                                            id="excerpt"
                                            name="excerpt"
                                            placeholder="Short description..."
                                        />
                                        <InputError message={errors.excerpt} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>
                                            {__('label.layout', 'Layout')}
                                        </Label>
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
                                        <Label>
                                            {__('label.page_type', 'Page type')}
                                        </Label>
                                        <Select
                                            value={pageType}
                                            onValueChange={(value) => {
                                                setPageType(value);
                                                if (value !== 'module')
                                                    setModuleName(null);
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
                                        <InputError
                                            message={errors.page_type}
                                        />
                                    </div>

                                    {pageType === 'module' && (
                                        <div className="grid gap-2">
                                            <Label>
                                                {__('label.module', 'Module')}
                                            </Label>
                                            <Select
                                                value={moduleName ?? ''}
                                                onValueChange={(value) =>
                                                    setModuleName(
                                                        value === ''
                                                            ? null
                                                            : value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select module" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {moduleOptions.map(
                                                        ([key, mod]) => (
                                                            <SelectItem
                                                                key={key}
                                                                value={key}
                                                            >
                                                                {mod.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.module_name}
                                            />
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
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        (errors as any)[
                                                            'module_config.content_id'
                                                        ]
                                                    }
                                                />
                                            </div>
                                        )}

                                    {pageType === 'module' &&
                                        moduleName === 'faq' && (
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
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        (errors as any)[
                                                            'module_config.category'
                                                        ]
                                                    }
                                                />
                                            </div>
                                        )}
                                </TabsContent>

                                <TabsContent value="seo" className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="seo_title">
                                            {__('label.seo_title', 'SEO title')}
                                        </Label>
                                        <Input
                                            id="seo_title"
                                            name="seo_title"
                                            placeholder="SEO title"
                                        />
                                        <InputError
                                            message={errors.seo_title}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="seo_description">
                                            {__(
                                                'label.seo_description',
                                                'SEO description',
                                            )}
                                        </Label>
                                        <Textarea
                                            id="seo_description"
                                            name="seo_description"
                                            placeholder="SEO description"
                                        />
                                        <InputError
                                            message={errors.seo_description}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="seo_canonical">
                                            {__(
                                                'label.canonical_url',
                                                'Canonical URL',
                                            )}
                                        </Label>
                                        <Input
                                            id="seo_canonical"
                                            name="seo_canonical"
                                            placeholder="https://..."
                                        />
                                        <InputError
                                            message={errors.seo_canonical}
                                        />
                                    </div>
                                </TabsContent>

                                <div className="flex items-center gap-4 pt-2">
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? __(
                                                  'misc.processing',
                                                  'Creating...',
                                              )
                                            : __(
                                                  'action.create_page',
                                                  'Create Page',
                                              )}
                                    </Button>
                                </div>
                            </Tabs>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
