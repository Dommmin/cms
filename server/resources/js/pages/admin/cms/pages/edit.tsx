import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, EyeIcon, GlobeIcon, PencilIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as PageBuilderController from '@/actions/App/Http/Controllers/Admin/Cms/PageBuilderController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import PreviewController from '@/actions/App/Http/Controllers/Admin/PreviewController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalizedField } from '@/components/ui/localized-field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SlugField } from '@/components/ui/slug-field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { EditProps } from './edit.types';

export default function Edit({ page, modules, pages }: EditProps) {
    const { locales, frontendUrl } = usePage().props as {
        locales: SharedLocale[];
        frontendUrl: string;
    };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const moduleOptions = useMemo(
        () => Object.entries(modules ?? {}),
        [modules],
    );

    const __ = useTranslation();
    const [layout] = useState<string>(page.layout ?? 'default');
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
    const [contentValues, setContentValues] = useState<Record<string, string>>(
        page.content ?? { [defaultLocale]: '' },
    );
    const [richContentValues, setRichContentValues] = useState<
        Record<string, string>
    >(page.rich_content ?? { [defaultLocale]: '' });
    const [slugValues, setSlugValues] = useState<Record<string, string>>(
        page.slug ?? { [defaultLocale]: '' },
    );
    const [parentId, setParentId] = useState<string>(
        page.parent_id ? String(page.parent_id) : 'none',
    );
    const [autoGenerateSlug, setAutoGenerateSlug] = useState(
        locales.every((l) => {
            const src = page.title?.[l.code] ?? '';
            const sl = (page.slug ?? {})[l.code] ?? '';
            return src === '' || sl === slugify(src);
        }),
    );

    const displayTitle =
        titleValues[defaultLocale] ?? Object.values(titleValues)[0] ?? '';

    const handleTitleChange = (value: Record<string, string>) => {
        setTitleValues(value);
        if (autoGenerateSlug) {
            setSlugValues((prev) => {
                const updated = { ...prev };
                locales.forEach((l) => {
                    updated[l.code] = slugify(value[l.code] ?? '');
                });
                return updated;
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: PageController.index.url() },
        { title: displayTitle, href: PageController.edit.url(page.id) },
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
                                    href={PreviewController.url({
                                        query: {
                                            url: `${frontendUrl}/${slugValues[defaultLocale] ?? ''}`,
                                            entity_type: 'page',
                                            entity_id: String(page.id),
                                            entity_name: displayTitle,
                                            admin_url: PageController.edit.url(
                                                page.id,
                                            ),
                                        },
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    {__('action.preview', 'Preview')}
                                </a>
                            </Button>
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
                            {pageType === 'blocks' && (
                                <Button asChild variant="outline">
                                    <Link
                                        href={PageBuilderController.show.url(
                                            page.id,
                                        )}
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
                                            PageController.unpublish.url(
                                                page.id,
                                            ),
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
                                            PageController.publish.url(page.id),
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
                        {page.locale ? (
                            <Badge
                                variant="outline"
                                className="font-mono uppercase"
                            >
                                {page.locale}
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Global</Badge>
                        )}
                    </div>

                    <Form
                        action={PageController.update.url(page.id)}
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
                                {locales.map((locale) => (
                                    <input
                                        key={`content-${locale.code}`}
                                        type="hidden"
                                        name={`content[${locale.code}]`}
                                        value={contentValues[locale.code] ?? ''}
                                    />
                                ))}
                                {locales.map((locale) => (
                                    <input
                                        key={`rich_content-${locale.code}`}
                                        type="hidden"
                                        name={`rich_content[${locale.code}]`}
                                        value={
                                            richContentValues[locale.code] ?? ''
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
                                        <LocalizedField
                                            label={__('label.title', 'Title')}
                                            name="title"
                                            value={titleValues}
                                            onChange={handleTitleChange}
                                            required
                                            errors={
                                                errors as Record<string, string>
                                            }
                                        />

                                        <div className="grid gap-2">
                                            {locales.map((locale) => (
                                                <input
                                                    key={`slug-${locale.code}`}
                                                    type="hidden"
                                                    name={`slug[${locale.code}]`}
                                                    value={
                                                        slugValues[
                                                            locale.code
                                                        ] ?? ''
                                                    }
                                                />
                                            ))}
                                            <SlugField
                                                label={__('label.slug', 'Slug')}
                                                name="slug"
                                                value={slugValues}
                                                onChange={setSlugValues}
                                                autoGenerate={autoGenerateSlug}
                                                onAutoGenerateChange={(
                                                    auto,
                                                ) => {
                                                    setAutoGenerateSlug(auto);
                                                    if (auto) {
                                                        setSlugValues(
                                                            (prev) => {
                                                                const updated =
                                                                    {
                                                                        ...prev,
                                                                    };
                                                                locales.forEach(
                                                                    (l) => {
                                                                        updated[
                                                                            l.code
                                                                        ] =
                                                                            slugify(
                                                                                titleValues[
                                                                                    l
                                                                                        .code
                                                                                ] ??
                                                                                    '',
                                                                            );
                                                                    },
                                                                );
                                                                return updated;
                                                            },
                                                        );
                                                    }
                                                }}
                                                locales={locales}
                                                errors={
                                                    errors as Record<
                                                        string,
                                                        string
                                                    >
                                                }
                                                required
                                            />
                                        </div>

                                        <LocalizedField
                                            label={__(
                                                'label.excerpt',
                                                'Excerpt',
                                            )}
                                            name="excerpt"
                                            type="textarea"
                                            value={excerptValues}
                                            onChange={setExcerptValues}
                                            placeholder="Short description..."
                                            rows={3}
                                            errors={
                                                errors as Record<string, string>
                                            }
                                        />

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
                                                <div className="space-y-4">
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
                                                                (page
                                                                    .module_config
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
                                                    <div className="grid gap-2">
                                                        <LocalizedField
                                                            label={__(
                                                                'label.rich_content',
                                                                'Rich Content',
                                                            )}
                                                            type="richtext"
                                                            name="rich_content"
                                                            value={
                                                                richContentValues
                                                            }
                                                            onChange={
                                                                setRichContentValues
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <LocalizedField
                                                            label={__(
                                                                'label.content_plain',
                                                                'Content (plain)',
                                                            )}
                                                            type="textarea"
                                                            name="content"
                                                            value={
                                                                contentValues
                                                            }
                                                            onChange={
                                                                setContentValues
                                                            }
                                                        />
                                                    </div>
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
