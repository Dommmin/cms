import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    EyeIcon,
    GlobeIcon,
    LayoutIcon,
    PencilIcon,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useAdminLocale } from '@/hooks/use-admin-locale';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { ModuleConfig, PageData, ParentPage, EditProps } from './edit.types';

export default function Edit({ page, modules, pages }: EditProps) {
    const { locales, frontendUrl } = usePage().props as {
        locales: SharedLocale[];
        frontendUrl: string;
    };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);

    const moduleOptions = useMemo(
        () => Object.entries(modules ?? {}),
        [modules],
    );

    const __ = useTranslation();
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
    const [slugTranslations, setSlugTranslations] = useState<
        Record<string, string>
    >(page.slug_translations ?? {});
    const [parentId, setParentId] = useState<string>(
        page.parent_id ? String(page.parent_id) : 'none',
    );
    const [slug, setSlug] = useState(page.slug);
    const [isSlugManual, setIsSlugManual] = useState(
        page.slug !== slugify(page.title?.[defaultLocale] ?? ''),
    );

    // Non-default locales that can have translated slugs
    const translatableLocales = locales.filter((l) => !l.is_default);

    const displayTitle =
        titleValues[defaultLocale] ?? Object.values(titleValues)[0] ?? '';

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
                            page.is_published
                                ? __('status.published_page', 'Published page')
                                : __('status.draft', 'Draft')
                        }
                    >
                        <PageHeaderActions>
                            <Button asChild variant="outline">
                                <a
                                    href={`/admin/preview?${new URLSearchParams({ url: `${frontendUrl}/${page.slug}`, entity_type: 'page', entity_id: String(page.id), entity_name: displayTitle, admin_url: `/admin/cms/pages/${page.id}/edit` }).toString()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    {__('action.preview', 'Preview')}
                                </a>
                            </Button>
                            <Button asChild variant="outline">
                                <Link
                                    href="/admin/cms/pages"
                                    prefetch
                                    cacheFor={30}
                                >
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    {__('action.back', 'Back')}
                                </Link>
                            </Button>
                            {pageType === 'blocks' && (
                                <Button asChild variant="outline">
                                    <Link
                                        href={`/admin/cms/pages/${page.id}/builder`}
                                        prefetch
                                        cacheFor={30}
                                    >
                                        <PencilIcon className="mr-2 h-4 w-4" />
                                        {__(
                                            'action.open_builder',
                                            'Open Builder',
                                        )}
                                    </Link>
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
                                    {__('action.unpublish', 'Unpublish')}
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
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
                                    {__('action.publish', 'Publish')}
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
                            {page.is_published
                                ? __('status.published', 'Published')
                                : __('status.draft', 'Draft')}
                        </Badge>
                        <Badge variant="outline">
                            <LayoutIcon className="mr-1 h-3 w-3" />
                            {page.layout}
                        </Badge>
                        {page.locale ? (
                            <Badge variant="outline" className="font-mono uppercase">
                                {page.locale}
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Global</Badge>
                        )}
                    </div>

                    <Form
                        action={`/admin/cms/pages/${page.id}`}
                        method="put"
                        options={{ preserveScroll: true }}
                        className="max-w-2xl"
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
                                <input
                                    type="hidden"
                                    name="parent_id"
                                    value={parentId === 'none' ? '' : parentId}
                                />
                                <input
                                    type="hidden"
                                    name="locale"
                                    value={page.locale ?? ''}
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
                                {/* Hidden inputs for slug translations */}
                                {translatableLocales.map((locale) => (
                                    <input
                                        key={`slug_translations-${locale.code}`}
                                        type="hidden"
                                        name={`slug_translations[${locale.code}]`}
                                        value={
                                            slugTranslations[locale.code] ?? ''
                                        }
                                    />
                                ))}

                                <Tabs
                                    defaultValue="general"
                                    className="space-y-6"
                                >
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
                                                        <SelectValue
                                                            placeholder={__(
                                                                'placeholder.no_parent',
                                                                'No parent (top-level)',
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            {__(
                                                                'misc.no_parent',
                                                                '— No parent (top-level) —',
                                                            )}
                                                        </SelectItem>
                                                        {pages.map((p) => (
                                                            <SelectItem
                                                                key={p.id}
                                                                value={String(
                                                                    p.id,
                                                                )}
                                                            >
                                                                /
                                                                {typeof p.title ===
                                                                'string'
                                                                    ? p.title
                                                                    : Object.values(
                                                                          p.title,
                                                                      )[0]}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        (errors as any)
                                                            .parent_id
                                                    }
                                                />
                                            </div>
                                        )}
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label>
                                                    {__('label.title', 'Title')}
                                                </Label>
                                                <LocaleTabSwitcher
                                                    locales={locales}
                                                    activeLocale={activeLocale}
                                                    onLocaleChange={
                                                        setActiveLocale
                                                    }
                                                />
                                            </div>
                                            <Input
                                                required
                                                value={
                                                    titleValues[activeLocale] ??
                                                    ''
                                                }
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    setTitleValues((prev) => ({
                                                        ...prev,
                                                        [activeLocale]: value,
                                                    }));
                                                    if (
                                                        !isSlugManual &&
                                                        activeLocale ===
                                                            defaultLocale
                                                    ) {
                                                        setSlug(slugify(value));
                                                    }
                                                }}
                                            />
                                            <InputError
                                                message={errors.title}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="slug">
                                                {__(
                                                    'label.slug_default',
                                                    'Slug (default)',
                                                )}
                                            </Label>
                                            <Input
                                                id="slug"
                                                name="slug"
                                                required
                                                value={slug}
                                                readOnly={!isSlugManual}
                                                onChange={(e) =>
                                                    setSlug(
                                                        slugify(e.target.value),
                                                    )
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
                                                            setSlug(
                                                                slugify(
                                                                    titleValues[
                                                                        defaultLocale
                                                                    ] ?? '',
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-input"
                                                />
                                                {__(
                                                    'misc.set_slug_manually',
                                                    'Set slug manually',
                                                )}
                                            </label>
                                        </div>

                                        {translatableLocales.length > 0 && (
                                            <div className="grid gap-3 rounded-lg border p-4">
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        {__(
                                                            'label.slug_translations',
                                                            'Slug Translations',
                                                        )}
                                                    </Label>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {__(
                                                            'misc.slug_translations_desc',
                                                            'Define locale-specific slugs. Leave blank to use the default slug.',
                                                        )}
                                                    </p>
                                                </div>
                                                {translatableLocales.map(
                                                    (locale) => (
                                                        <div
                                                            key={locale.code}
                                                            className="grid gap-1"
                                                        >
                                                            <Label
                                                                htmlFor={`slug_translation_${locale.code}`}
                                                                className="text-xs text-muted-foreground"
                                                            >
                                                                {locale.name} (
                                                                {locale.code})
                                                            </Label>
                                                            <Input
                                                                id={`slug_translation_${locale.code}`}
                                                                placeholder={
                                                                    page.slug
                                                                }
                                                                value={
                                                                    slugTranslations[
                                                                        locale
                                                                            .code
                                                                    ] ?? ''
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const val =
                                                                        e.target.value
                                                                            .toLowerCase()
                                                                            .replace(
                                                                                /[^a-z0-9-]/g,
                                                                                '-',
                                                                            )
                                                                            .replace(
                                                                                /-+/g,
                                                                                '-',
                                                                            )
                                                                            .replace(
                                                                                /^-|-$/g,
                                                                                '',
                                                                            );
                                                                    setSlugTranslations(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [locale.code]:
                                                                                val,
                                                                        }),
                                                                    );
                                                                }}
                                                            />
                                                            <InputError
                                                                message={
                                                                    (
                                                                        errors as Record<
                                                                            string,
                                                                            string
                                                                        >
                                                                    )[
                                                                        `slug_translations.${locale.code}`
                                                                    ]
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label>
                                                    {__(
                                                        'label.excerpt',
                                                        'Excerpt',
                                                    )}
                                                </Label>
                                                <LocaleTabSwitcher
                                                    locales={locales}
                                                    activeLocale={activeLocale}
                                                    onLocaleChange={
                                                        setActiveLocale
                                                    }
                                                />
                                            </div>
                                            <Textarea
                                                value={
                                                    excerptValues[
                                                        activeLocale
                                                    ] ?? ''
                                                }
                                                onChange={(e) =>
                                                    setExcerptValues(
                                                        (prev) => ({
                                                            ...prev,
                                                            [activeLocale]:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                placeholder="Short description..."
                                            />
                                            <InputError
                                                message={errors.excerpt}
                                            />
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
                                                    <SelectValue
                                                        placeholder={__(
                                                            'placeholder.select_layout',
                                                            'Select layout',
                                                        )}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default">
                                                        {__(
                                                            'layout.standard',
                                                            'Standard',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="full_width">
                                                        {__(
                                                            'layout.full_width',
                                                            'Full width',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="sidebar">
                                                        {__(
                                                            'layout.sidebar',
                                                            'Sidebar',
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.layout}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>
                                                {__(
                                                    'label.page_type',
                                                    'Page type',
                                                )}
                                            </Label>
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
                                                    <SelectValue
                                                        placeholder={__(
                                                            'placeholder.select_page_type',
                                                            'Select page type',
                                                        )}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="blocks">
                                                        {__(
                                                            'type.blocks',
                                                            'Blocks',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="module">
                                                        {__(
                                                            'type.module',
                                                            'Module',
                                                        )}
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
                                                    {__(
                                                        'label.module',
                                                        'Module',
                                                    )}
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
                                                        <SelectValue
                                                            placeholder={__(
                                                                'placeholder.select_module',
                                                                'Select module',
                                                            )}
                                                        />
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
                                                        {__(
                                                            'label.content_entry_id',
                                                            'Content entry ID',
                                                        )}
                                                    </Label>
                                                    <Input
                                                        id="content_id"
                                                        name="module_config[content_id]"
                                                        type="number"
                                                        defaultValue={
                                                            /* eslint-disable @typescript-eslint/no-explicit-any */
                                                            (page.module_config
                                                                ?.content_id as any) ??
                                                            /* eslint-enable @typescript-eslint/no-explicit-any */
                                                            ''
                                                        }
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
                                                        {__(
                                                            'label.faq_category_optional',
                                                            'FAQ category (optional)',
                                                        )}
                                                    </Label>
                                                    <Input
                                                        id="category"
                                                        name="module_config[category]"
                                                        defaultValue={
                                                            /* eslint-disable @typescript-eslint/no-explicit-any */
                                                            (page.module_config
                                                                ?.category as any) ??
                                                            /* eslint-enable @typescript-eslint/no-explicit-any */
                                                            ''
                                                        }
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

                                    <TabsContent
                                        value="seo"
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="seo_title">
                                                {__(
                                                    'label.seo_title',
                                                    'SEO title',
                                                )}
                                            </Label>
                                            <Input
                                                id="seo_title"
                                                name="seo_title"
                                                defaultValue={
                                                    page.seo_title ?? ''
                                                }
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
                                                {__(
                                                    'label.canonical_url',
                                                    'Canonical URL',
                                                )}
                                            </Label>
                                            <Input
                                                id="seo_canonical"
                                                name="seo_canonical"
                                                defaultValue={
                                                    page.seo_canonical ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.seo_canonical}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="meta_robots">
                                                {__(
                                                    'label.meta_robots',
                                                    'Meta Robots',
                                                )}
                                            </Label>
                                            <select
                                                id="meta_robots"
                                                name="meta_robots"
                                                defaultValue={
                                                    page.meta_robots ??
                                                    'index, follow'
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                            >
                                                <option value="index, follow">
                                                    Index &amp; Follow
                                                    (Recommended)
                                                </option>
                                                <option value="noindex, follow">
                                                    No Index, Follow
                                                </option>
                                                <option value="index, nofollow">
                                                    Index, No Follow
                                                </option>
                                                <option value="noindex, nofollow">
                                                    No Index, No Follow
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.meta_robots}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="og_image">
                                                {__(
                                                    'label.og_image_url',
                                                    'OG Image URL',
                                                )}
                                            </Label>
                                            <Input
                                                id="og_image"
                                                name="og_image"
                                                defaultValue={
                                                    page.og_image ?? ''
                                                }
                                                placeholder="https://example.com/og-image.jpg"
                                            />
                                            <InputError
                                                message={errors.og_image}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="sitemap_exclude"
                                                name="sitemap_exclude"
                                                value="1"
                                                defaultChecked={
                                                    page.sitemap_exclude ??
                                                    false
                                                }
                                                className="h-4 w-4 rounded border-input"
                                            />
                                            <Label htmlFor="sitemap_exclude">
                                                {__(
                                                    'label.exclude_sitemap',
                                                    'Exclude from XML sitemap',
                                                )}
                                            </Label>
                                        </div>
                                    </TabsContent>

                                    <div className="flex items-center gap-4 pt-2">
                                        <Button
                                            variant="outline"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? __('misc.saving', 'Saving...')
                                                : __(
                                                      'action.save_changes',
                                                      'Save Changes',
                                                  )}
                                        </Button>
                                    </div>
                                </Tabs>
                            </>
                        )}
                    </Form>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
