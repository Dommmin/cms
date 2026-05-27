import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as BlogPostController from '@/actions/App/Http/Controllers/Admin/BlogPostController';

import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalizedField } from '@/components/ui/localized-field';
import { SlugField } from '@/components/ui/slug-field';
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
import type { CreateProps, FormData } from './create.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Posts', href: BlogPostController.index.url() },
    { title: 'Create Post', href: BlogPostController.create.url() },
];

export default function CreateBlogPost({
    categories,
    available_tags,
}: CreateProps) {
    const { locales } = usePage<{ locales: SharedLocale[] }>().props;
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const __ = useTranslation();

    const [data, setData] = useState<FormData>({
        title: { [defaultLocale]: '' },
        slug: { [defaultLocale]: '' },
        excerpt: { [defaultLocale]: '' },
        content: { [defaultLocale]: '' },
        content_json: { [defaultLocale]: '' },
        content_type: 'richtext',
        status: 'draft',
        published_at: '',
        blog_category_id: '',
        tags: [],
        available_locales: null,
        is_featured: false,
        featured_image: '',
        seo_title: '',
        seo_description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
    const [tagInput, setTagInput] = useState('');

    const handleTitleChange = (value: Record<string, string>) => {
        setData((prev) => ({
            ...prev,
            title: value,
            slug: autoGenerateSlug
                ? Object.keys(value).reduce((acc, locale) => {
                      acc[locale] = slugify(value[locale] || '');
                      return acc;
                  }, {} as Record<string, string>)
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
            blog_category_id: data.blog_category_id || null,
            featured_image: data.featured_image || null,
        };

        router.post(BlogPostController.store.url(), payload, {
            onError: (errs) => {
                setErrors(errs);
                toast.error(__('misc.fix_errors', 'Please fix the errors below'));
            },
            onFinish: () => setProcessing(false),
        });
    };

    const buttonText = data.status === 'published'
        ? __('action.publish', 'Publish')
        : data.status === 'scheduled'
            ? __('action.schedule', 'Schedule')
            : __('action.save_draft', 'Save Draft');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Blog Post" />
            <Wrapper>
                <PageHeader
                    title="Create Blog Post"
                    description="Write a new blog post"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={BlogPostController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
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
                                    <LocalizedField
                                        label={__('label.title', 'Title')}
                                        name="title"
                                        value={data.title}
                                        onChange={handleTitleChange}
                                        errors={errors}
                                        required
                                        placeholder="Post title"
                                    />

                                    <SlugField
                                        label={__('label.slug', 'Slug')}
                                        name="slug"
                                        value={data.slug}
                                        onChange={(val) =>
                                            setData((prev) => ({
                                                ...prev,
                                                slug: val,
                                            }))
                                        }
                                        autoGenerate={autoGenerateSlug}
                                        onAutoGenerateChange={(auto) => {
                                            setAutoGenerateSlug(auto);
                                            if (auto) {
                                                setData((prev) => {
                                                    const updated = {
                                                        ...prev.slug,
                                                    };
                                                    locales.forEach((l) => {
                                                        updated[l.code] =
                                                            slugify(
                                                                prev.title[
                                                                    l.code
                                                                ] ?? '',
                                                            );
                                                    });
                                                    return {
                                                        ...prev,
                                                        slug: updated,
                                                    };
                                                });
                                            }
                                        }}
                                        locales={locales}
                                        errors={errors}
                                    />

                                    <LocalizedField
                                        label={__('label.excerpt', 'Excerpt')}
                                        name="excerpt"
                                        type="textarea"
                                        value={data.excerpt}
                                        onChange={(val) =>
                                            setData((prev) => ({
                                                ...prev,
                                                excerpt: val,
                                            }))
                                        }
                                        placeholder="Short description of the post"
                                        rows={3}
                                        errors={errors}
                                    />

                                    <LocalizedField
                                        label={__('label.content', 'Content')}
                                        name="content"
                                        type={
                                            data.content_type === 'richtext'
                                                ? 'richtext'
                                                : 'markdown'
                                        }
                                        value={data.content}
                                        onChange={(val) =>
                                            setData((prev) => ({
                                                ...prev,
                                                content: val,
                                            }))
                                        }
                                        jsonValue={data.content_json}
                                        onJsonChange={(val) =>
                                            setData((prev) => ({
                                                ...prev,
                                                content_json: val,
                                            }))
                                        }
                                        errors={errors}
                                        required
                                        placeholder="Write your post content..."
                                        headerEnd={
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
                                                        Rich Text
                                                    </SelectItem>
                                                    <SelectItem value="markdown">
                                                        Markdown
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        }
                                    />
                                </TabsContent>

                                <TabsContent value="seo" className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="seo_title">
                                            SEO Title
                                        </Label>
                                        <Input
                                            id="seo_title"
                                            value={data.seo_title}
                                            onChange={(e) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    seo_title: e.target.value,
                                                }))
                                            }
                                            placeholder="Custom page title for search engines"
                                        />
                                        <InputError
                                            message={errors.seo_title}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="seo_description">
                                            SEO Description
                                        </Label>
                                        <Textarea
                                            id="seo_description"
                                            value={data.seo_description}
                                            onChange={(e) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    seo_description:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="Meta description for search engines"
                                            rows={2}
                                        />
                                        <InputError
                                            message={errors.seo_description}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">
                                    Publishing
                                </h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
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
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="scheduled">
                                                Scheduled
                                            </SelectItem>
                                            <SelectItem value="published">
                                                Published
                                            </SelectItem>
                                            <SelectItem value="archived">
                                                Archived
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>

                                {data.status === 'scheduled' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="published_at">
                                            Publish At *
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
                                        Featured post
                                    </Label>
                                </div>

                                {locales.length > 1 && (
                                    <div className="space-y-2 border-t pt-3">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Visible in locales
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Leave all unchecked to show in all
                                            languages.
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
                                    Organization
                                </h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="blog_category_id">
                                        Category
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
                                            <SelectValue placeholder="Select a category" />
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
                                    <Label>Tags</Label>
                                    {data.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {data.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setData((prev) => ({
                                                                ...prev,
                                                                tags: prev.tags.filter(
                                                                    (t) =>
                                                                        t !==
                                                                        tag,
                                                                ),
                                                            }))
                                                        }
                                                        className="text-muted-foreground hover:text-foreground"
                                                        aria-label={`Remove ${tag}`}
                                                    >
                                                        <XIcon className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <Input
                                        id="tags"
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ','
                                            ) {
                                                e.preventDefault();
                                                const value = tagInput.trim();
                                                if (
                                                    value &&
                                                    !data.tags.includes(value)
                                                ) {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        tags: [
                                                            ...prev.tags,
                                                            value,
                                                        ],
                                                    }));
                                                }
                                                setTagInput('');
                                            }
                                        }}
                                        placeholder="Add tag and press Enter"
                                        list="available-tags-list"
                                    />
                                    <datalist id="available-tags-list">
                                        {available_tags
                                            .filter(
                                                (t) =>
                                                    !data.tags.includes(t.name),
                                            )
                                            .map((t) => (
                                                <option
                                                    key={t.id}
                                                    value={t.name}
                                                />
                                            ))}
                                    </datalist>
                                    {available_tags.filter(
                                        (t) => !data.tags.includes(t.name),
                                    ).length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {available_tags
                                                .filter(
                                                    (t) =>
                                                        !data.tags.includes(
                                                            t.name,
                                                        ),
                                                )
                                                .slice(0, 8)
                                                .map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setData((prev) => ({
                                                                ...prev,
                                                                tags: [
                                                                    ...prev.tags,
                                                                    t.name,
                                                                ],
                                                            }))
                                                        }
                                                        className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
                                                    >
                                                        + {t.name}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                    <InputError message={errors.tags} />
                                </div>
                            </div>

                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">
                                    Featured Image
                                </h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="featured_image">
                                        Image URL
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
                                type="submit"
                                disabled={processing}
                                className="w-full"
                                variant="outline"
                            >
                                {processing
                                    ? __('action.saving', 'Saving…')
                                    : buttonText}
                            </Button>
                        </div>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
