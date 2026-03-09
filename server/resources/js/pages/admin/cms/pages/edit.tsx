import { useAdminLocale } from '@/hooks/use-admin-locale';
import { Form, Head, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, GlobeIcon, LayoutIcon, PencilIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
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
import type { SharedLocale } from '@/types/global';

type ModuleConfig = {
    label: string;
    description?: string;
};

type PageData = {
    id: number;
    parent_id: number | null;
    title: Record<string, string>;
    slug: string;
    excerpt: Record<string, string> | null;
    layout: string;
    page_type: string;
    module_name: string | null;
    module_config: Record<string, unknown> | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_canonical: string | null;
    is_published: boolean;
};

type Props = {
    page: PageData;
    modules: Record<string, ModuleConfig>;
};

export default function Edit({ page, modules }: Props) {
    const { locales } = usePage().props as { locales: SharedLocale[] };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);

    const moduleOptions = useMemo(
        () => Object.entries(modules ?? {}),
        [modules],
    );

    const [layout, setLayout] = useState<string>(page.layout ?? 'default');
    const [pageType, setPageType] = useState<string>(
        page.page_type ?? 'blocks',
    );
    const [moduleName, setModuleName] = useState<string | null>(
        page.module_name ?? null,
    );
    const [titleValues, setTitleValues] = useState<Record<string, string>>(
        page.title ?? { [defaultLocale]: '' },
    );
    const [excerptValues, setExcerptValues] = useState<Record<string, string>>(
        page.excerpt ?? { [defaultLocale]: '' },
    );

    const displayTitle = titleValues[defaultLocale] ?? Object.values(titleValues)[0] ?? '';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/admin/cms/pages' },
        { title: displayTitle, href: `/admin/cms/pages/${page.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${displayTitle}`} />
            <Wrapper>
                <div className="space-y-6">
                    <PageHeader
                        title={displayTitle}
                        description={
                            page.is_published ? 'Published page' : 'Draft'
                        }
                    >
                        <PageHeaderActions>
                            <Button
                                variant="outline"
                                onClick={() => router.visit('/admin/cms/pages')}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            {pageType === 'blocks' && (
                                <Button
                                    variant="default"
                                    onClick={() =>
                                        router.visit(
                                            `/admin/cms/pages/${page.id}/builder`,
                                        )
                                    }
                                >
                                    <PencilIcon className="mr-2 h-4 w-4" />
                                    Open Builder
                                </Button>
                            )}
                            {page.is_published ? (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        router.post(
                                            `/admin/cms/pages/${page.id}/unpublish`,
                                            undefined,
                                            {
                                                onSuccess: () =>
                                                    router.reload(),
                                            },
                                        );
                                    }}
                                >
                                    <GlobeIcon className="mr-2 h-4 w-4" />
                                    Unpublish
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    onClick={() => {
                                        router.post(
                                            `/admin/cms/pages/${page.id}/publish`,
                                            undefined,
                                            {
                                                onSuccess: () =>
                                                    router.reload(),
                                            },
                                        );
                                    }}
                                >
                                    <GlobeIcon className="mr-2 h-4 w-4" />
                                    Publish
                                </Button>
                            )}
                        </PageHeaderActions>
                    </PageHeader>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant={
                                page.is_published ? 'default' : 'secondary'
                            }
                        >
                            {page.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline">
                            <LayoutIcon className="mr-1 h-3 w-3" />
                            {page.layout}
                        </Badge>
                    </div>

                    <Form
                        action={`/admin/cms/pages/${page.id}`}
                        method="put"
                        options={{ preserveScroll: true }}
                        className="max-w-2xl space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="layout"
                                    value={layout}
                                />
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
                                {/* Hidden inputs for all locale title/excerpt values */}
                                {locales.map((locale) => (
                                    <input
                                        key={`title-${locale.code}`}
                                        type="hidden"
                                        name={`title[${locale.code}]`}
                                        value={titleValues[locale.code] ?? ''}
                                    />
                                ))}
                                {locales.map((locale) => (
                                    <input
                                        key={`excerpt-${locale.code}`}
                                        type="hidden"
                                        name={`excerpt[${locale.code}]`}
                                        value={excerptValues[locale.code] ?? ''}
                                    />
                                ))}

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Title</Label>
                                        <LocaleTabSwitcher
                                            locales={locales}
                                            activeLocale={activeLocale}
                                            onLocaleChange={setActiveLocale}
                                        />
                                    </div>
                                    <Input
                                        required
                                        value={titleValues[activeLocale] ?? ''}
                                        onChange={(e) =>
                                            setTitleValues((prev) => ({
                                                ...prev,
                                                [activeLocale]: e.target.value,
                                            }))
                                        }
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        required
                                        defaultValue={page.slug}
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Excerpt</Label>
                                        <LocaleTabSwitcher
                                            locales={locales}
                                            activeLocale={activeLocale}
                                            onLocaleChange={setActiveLocale}
                                        />
                                    </div>
                                    <Textarea
                                        value={excerptValues[activeLocale] ?? ''}
                                        onChange={(e) =>
                                            setExcerptValues((prev) => ({
                                                ...prev,
                                                [activeLocale]: e.target.value,
                                            }))
                                        }
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
                                                defaultValue={
                                                    (page.module_config
                                                        ?.content_id as any) ??
                                                    ''
                                                }
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

                                {pageType === 'module' &&
                                    moduleName === 'faq' && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="category">
                                                FAQ category (optional)
                                            </Label>
                                            <Input
                                                id="category"
                                                name="module_config[category]"
                                                defaultValue={
                                                    (page.module_config
                                                        ?.category as any) ?? ''
                                                }
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
                                        defaultValue={page.seo_title ?? ''}
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
                                        defaultValue={
                                            page.seo_description ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.seo_description}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="seo_canonical">
                                        Canonical URL
                                    </Label>
                                    <Input
                                        id="seo_canonical"
                                        name="seo_canonical"
                                        defaultValue={page.seo_canonical ?? ''}
                                    />
                                    <InputError
                                        message={errors.seo_canonical}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
