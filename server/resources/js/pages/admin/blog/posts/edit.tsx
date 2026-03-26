import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, ExternalLink, EyeIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { SeoPanel } from '@/components/seo-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { VersionHistory } from '@/components/version-history';
import Wrapper from '@/components/wrapper';
import { useAdminLocale } from '@/hooks/use-admin-locale';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { EditProps, FormData } from './edit.types';

export default function EditBlogPost({ post, categories }: EditProps) {
    const { frontendUrl, locales } = usePage().props as {
        frontendUrl: string;
        locales: SharedLocale[];
    };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blog Posts', href: '/admin/blog/posts' },
        {
            title: post.title?.[defaultLocale] ?? 'Edit Post',
            href: `/admin/blog/posts/${post.id}/edit`,
        },
    ];

    const __ = useTranslation();
    const [data, setData] = useState<FormData>({
        title: post.title ?? { [defaultLocale]: '' },
        slug: post.slug,
        excerpt: post.excerpt ?? { [defaultLocale]: '' },
        content: post.content ?? { [defaultLocale]: '' },
        content_type: post.content_type,
        status: post.status,
        blog_category_id: post.blog_category_id
            ? String(post.blog_category_id)
            : '',
        tags: post.tags ? post.tags.join(', ') : '',
        available_locales: post.available_locales ?? null,
        is_featured: post.is_featured,
        published_at: post.published_at ? post.published_at.slice(0, 16) : '',
        featured_image: post.featured_image ?? '',
        seo_title: post.seo_title ?? '',
        seo_description: post.seo_description ?? '',
        meta_robots: post.meta_robots ?? 'index, follow',
        og_image: post.og_image ?? null,
        sitemap_exclude: post.sitemap_exclude ?? false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [isSlugManual, setIsSlugManual] = useState(
        post.slug !== slugify(post.title?.[defaultLocale] ?? ''),
    );

    const handleTitleChange = (locale: string, value: string) => {
        setData((prev) => ({
            ...prev,
            title: { ...prev.title, [locale]: value },
            slug:
                !isSlugManual && locale === defaultLocale
                    ? slugify(value)
                    : prev.slug,
        }));
    };

    const handleContentTypeChange = (newType: 'richtext' | 'markdown') => {
        if (
            Object.values(data.content).some((v) => v) &&
            newType !== data.content_type
        ) {
            if (
                !confirm(
                    'Switching editor type will not auto-convert your content. Continue?',
                )
            ) {
                return;
            }
        }
        setData((prev) => ({ ...prev, content_type: newType }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const payload = {
            ...data,
            tags: data.tags
                ? data.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [],
            blog_category_id: data.blog_category_id || null,
            featured_image: data.featured_image || null,
            _method: 'PUT',
        };

        router.post(`/admin/blog/posts/${post.id}`, payload, {
            onSuccess: () =>
                toast.success(
                    __('misc.post_updated', 'Post updated successfully'),
                ),
            onError: (errs) => {
                setErrors(errs);
                toast.error(
                    __('misc.fix_errors', 'Please fix the errors below'),
                );
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${data.title[defaultLocale] ?? ''}`} />
            <Wrapper>
                <PageHeader
                    title={__('page.edit_blog_post', 'Edit Blog Post')}
                    description={data.title[defaultLocale] ?? ''}
                >
                    <PageHeaderActions>
                        {post.status === 'published' && (
                            <Button variant="outline" asChild>
                                <a
                                    href={`${frontendUrl}/blog/${post.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    {__('action.view_on_site', 'View on Site')}
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <a
                                href={`/admin/preview?${new URLSearchParams({ url: `${frontendUrl}/blog/${post.slug}`, entity_type: 'blog_post', entity_id: String(post.id), entity_name: data.title[defaultLocale] ?? post.slug, admin_url: `/admin/blog/posts/${post.id}/edit` }).toString()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                {__('action.preview', 'Preview')}
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/blog/posts"
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Column */}
                        <div className="lg:col-span-2">
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
                                    {/* Locale switcher */}
                                    {locales.length > 1 && (
                                        <div className="flex items-center gap-2 rounded-lg border p-3">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {__('misc.editing', 'Editing:')}
                                            </span>
                                            <LocaleTabSwitcher
                                                locales={locales}
                                                activeLocale={activeLocale}
                                                onLocaleChange={setActiveLocale}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="title">
                                            {__('label.title', 'Title')} *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={
                                                data.title[activeLocale] ?? ''
                                            }
                                            onChange={(e) =>
                                                handleTitleChange(
                                                    activeLocale,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Post title"
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">
                                            {__('label.slug', 'Slug')}
                                        </Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            readOnly={!isSlugManual}
                                            onChange={(e) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    slug: slugify(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            placeholder="post-slug"
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
                                                        setData((prev) => ({
                                                            ...prev,
                                                            slug: slugify(
                                                                prev.title[
                                                                    defaultLocale
                                                                ] ?? '',
                                                            ),
                                                        }));
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

                                    <div className="grid gap-2">
                                        <Label htmlFor="excerpt">
                                            {__('label.excerpt', 'Excerpt')}
                                        </Label>
                                        <Textarea
                                            id="excerpt"
                                            value={
                                                data.excerpt[activeLocale] ?? ''
                                            }
                                            onChange={(e) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    excerpt: {
                                                        ...prev.excerpt,
                                                        [activeLocale]:
                                                            e.target.value,
                                                    },
                                                }))
                                            }
                                            placeholder="Short description of the post"
                                            rows={3}
                                        />
                                        <InputError message={errors.excerpt} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label>
                                                {__('label.content', 'Content')}{' '}
                                                *
                                            </Label>
                                            <Select
                                                value={data.content_type}
                                                onValueChange={(val) =>
                                                    handleContentTypeChange(
                                                        val as
                                                            | 'richtext'
                                                            | 'markdown',
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="richtext">
                                                        {__(
                                                            'type.rich_text',
                                                            'Rich Text',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="markdown">
                                                        {__(
                                                            'type.markdown',
                                                            'Markdown',
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {data.content_type === 'richtext' ? (
                                            <RichTextEditor
                                                key={`richtext-${activeLocale}`}
                                                value={
                                                    data.content[
                                                        activeLocale
                                                    ] ?? ''
                                                }
                                                onChange={(val) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        content: {
                                                            ...prev.content,
                                                            [activeLocale]: val,
                                                        },
                                                    }))
                                                }
                                                placeholder="Write your post content..."
                                            />
                                        ) : (
                                            <MarkdownEditor
                                                key={`markdown-${activeLocale}`}
                                                value={
                                                    data.content[
                                                        activeLocale
                                                    ] ?? ''
                                                }
                                                onChange={(val) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        content: {
                                                            ...prev.content,
                                                            [activeLocale]: val,
                                                        },
                                                    }))
                                                }
                                            />
                                        )}
                                        <InputError message={errors.content} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="seo" className="space-y-6">
                                    <SeoPanel
                                        data={{
                                            seo_title: data.seo_title,
                                            seo_description:
                                                data.seo_description,
                                            meta_robots: data.meta_robots,
                                            og_image: data.og_image,
                                            sitemap_exclude:
                                                data.sitemap_exclude,
                                        }}
                                        onChange={(field, value) =>
                                            setData((prev) => ({
                                                ...prev,
                                                [field]: value,
                                            }))
                                        }
                                        errors={errors}
                                        urlPath={`blog/${data.slug ?? post.slug}`}
                                        titleFallback={
                                            typeof data.title === 'object'
                                                ? Object.values(data.title)[0]
                                                : post.slug
                                        }
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">
                                    {__('misc.publishing', 'Publishing')}
                                </h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">
                                        {__('column.status', 'Status')}
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(val) =>
                                            setData((prev) => ({
                                                ...prev,
                                                status: val,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                {__('status.draft', 'Draft')}
                                            </SelectItem>
                                            <SelectItem value="scheduled">
                                                {__(
                                                    'status.scheduled',
                                                    'Scheduled',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="published">
                                                {__(
                                                    'status.published',
                                                    'Published',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="archived">
                                                {__(
                                                    'status.archived',
                                                    'Archived',
                                                )}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>

                                {data.status === 'scheduled' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="published_at">
                                            {__(
                                                'label.publish_at',
                                                'Publish At',
                                            )}{' '}
                                            *
                                        </Label>
                                        <Input
                                            id="published_at"
                                            type="datetime-local"
                                            value={data.published_at}
                                            onChange={(e) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    published_at:
                                                        e.target.value,
                                                }))
                                            }
                                        />
                                        <InputError
                                            message={errors.published_at}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onChange={(e) =>
                                            setData((prev) => ({
                                                ...prev,
                                                is_featured: e.target.checked,
                                            }))
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label
                                        htmlFor="is_featured"
                                        className="font-normal"
                                    >
                                        {__(
                                            'label.featured_post',
                                            'Featured post',
                                        )}
                                    </Label>
                                </div>

                                {locales.length > 1 && (
                                    <div className="space-y-2 border-t pt-3">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            {__(
                                                'misc.visible_in_locales',
                                                'Visible in locales',
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'misc.leave_all_unchecked',
                                                'Leave all unchecked to show in all languages.',
                                            )}
                                        </p>
                                        {locales.map((locale) => (
                                            <div
                                                key={locale.code}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`locale-${locale.code}`}
                                                    checked={
                                                        data.available_locales?.includes(
                                                            locale.code,
                                                        ) ?? false
                                                    }
                                                    onChange={(e) =>
                                                        setData((prev) => {
                                                            const current =
                                                                prev.available_locales ??
                                                                [];
                                                            const updated = e
                                                                .target.checked
                                                                ? [
                                                                      ...current,
                                                                      locale.code,
                                                                  ]
                                                                : current.filter(
                                                                      (c) =>
                                                                          c !==
                                                                          locale.code,
                                                                  );
                                                            return {
                                                                ...prev,
                                                                available_locales:
                                                                    updated.length >
                                                                    0
                                                                        ? updated
                                                                        : null,
                                                            };
                                                        })
                                                    }
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label
                                                    htmlFor={`locale-${locale.code}`}
                                                    className="font-normal"
                                                >
                                                    {locale.name} ({locale.code}
                                                    )
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">
                                    {__('misc.organization', 'Organization')}
                                </h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="blog_category_id">
                                        {__('label.category', 'Category')}
                                    </Label>
                                    <Select
                                        value={data.blog_category_id}
                                        onValueChange={(val) =>
                                            setData((prev) => ({
                                                ...prev,
                                                blog_category_id: val,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={__(
                                                    'placeholder.select_category',
                                                    'Select a category',
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={String(cat.id)}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.blog_category_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tags">
                                        {__('label.tags', 'Tags')}
                                    </Label>
                                    <Input
                                        id="tags"
                                        value={data.tags}
                                        onChange={(e) =>
                                            setData((prev) => ({
                                                ...prev,
                                                tags: e.target.value,
                                            }))
                                        }
                                        placeholder="tag1, tag2, tag3"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {__(
                                            'misc.tags_comma_separated',
                                            'Separate tags with commas',
                                        )}
                                    </p>
                                    <InputError message={errors.tags} />
                                </div>
                            </div>

                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">
                                    {__(
                                        'misc.featured_image',
                                        'Featured Image',
                                    )}
                                </h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="featured_image">
                                        {__('label.image_url', 'Image URL')}
                                    </Label>
                                    <Input
                                        id="featured_image"
                                        value={data.featured_image}
                                        onChange={(e) =>
                                            setData((prev) => ({
                                                ...prev,
                                                featured_image: e.target.value,
                                            }))
                                        }
                                        placeholder="/storage/image.jpg"
                                    />
                                    <InputError
                                        message={errors.featured_image}
                                    />
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="submit"
                                disabled={processing}
                                className="w-full"
                            >
                                {processing
                                    ? __('misc.saving', 'Saving...')
                                    : __('action.save_changes', 'Save Changes')}
                            </Button>

                            <VersionHistory
                                modelType="blog-post"
                                modelId={post.id}
                            />
                        </div>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
