import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as BlogController from '@/actions/App/Http/Controllers/Admin/BlogController';
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
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { CreateProps } from './create.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blogs', href: BlogController.index.url() },
    { title: 'Create', href: BlogController.create.url() },
];

export default function CreateBlog({ users }: CreateProps) {
    const __ = useTranslation();
    const [data, setData] = useState({
        name_en: '',
        name_pl: '',
        slug: '',
        description_en: '',
        description_pl: '',
        layout: 'grid',
        posts_per_page: 12,
        commentable: true,
        default_author_id: '',
        seo_title: '',
        seo_description: '',
        is_active: true,
        position: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [autoSlug, setAutoSlug] = useState(true);

    const handleNameEnChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            name_en: value,
            slug: autoSlug ? slugify(value) : prev.slug,
        }));
    };

    const handleSlugChange = (value: string) => {
        setAutoSlug(value === '' || value === slugify(data.name_en));
        setData((prev) => ({ ...prev, slug: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            BlogController.store.url(),
            {
                name: { en: data.name_en, pl: data.name_pl },
                slug: data.slug || undefined,
                description: {
                    en: data.description_en,
                    pl: data.description_pl,
                },
                layout: data.layout,
                posts_per_page: data.posts_per_page,
                commentable: data.commentable,
                default_author_id: data.default_author_id || null,
                seo_title: data.seo_title || null,
                seo_description: data.seo_description || null,
                is_active: data.is_active,
                position: data.position,
            },
            {
                onSuccess: () =>
                    toast.success(
                        __('misc.blog_created', 'Blog created successfully'),
                    ),
                onError: (errs) => {
                    setErrors(errs);
                    toast.error(
                        __('misc.fix_errors', 'Please fix the errors below'),
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('page.create_blog', 'Create Blog')} />
            <Wrapper>
                <PageHeader
                    title={__('page.create_blog', 'Create Blog')}
                    description={__(
                        'page.create_blog_desc',
                        'Add a new blog container to organize your posts',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={BlogController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name_en">
                            {__('label.name_en', 'Name (EN)')} *
                        </Label>
                        <Input
                            id="name_en"
                            value={data.name_en}
                            onChange={(e) => handleNameEnChange(e.target.value)}
                            required
                            autoFocus
                            placeholder="Blog name in English"
                        />
                        <InputError message={errors['name.en']} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name_pl">
                            {__('label.name_pl', 'Name (PL)')}
                        </Label>
                        <Input
                            id="name_pl"
                            value={data.name_pl}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    name_pl: e.target.value,
                                }))
                            }
                            placeholder="Blog name in Polish"
                        />
                        <InputError message={errors['name.pl']} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">{__('label.slug', 'Slug')}</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="blog-slug (auto-generated)"
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description_en">
                            {__('label.description_en', 'Description (EN)')}
                        </Label>
                        <Textarea
                            id="description_en"
                            value={data.description_en}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    description_en: e.target.value,
                                }))
                            }
                            placeholder="Blog description in English"
                            rows={3}
                        />
                        <InputError message={errors['description.en']} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description_pl">
                            {__('label.description_pl', 'Description (PL)')}
                        </Label>
                        <Textarea
                            id="description_pl"
                            value={data.description_pl}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    description_pl: e.target.value,
                                }))
                            }
                            placeholder="Blog description in Polish"
                            rows={3}
                        />
                        <InputError message={errors['description.pl']} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="layout">
                            {__('label.layout', 'Layout')}
                        </Label>
                        <Select
                            value={data.layout}
                            onValueChange={(val) =>
                                setData((prev) => ({ ...prev, layout: val }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="grid">Grid</SelectItem>
                                <SelectItem value="list">List</SelectItem>
                                <SelectItem value="magazine">
                                    Magazine
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.layout} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="posts_per_page">
                            {__('label.posts_per_page', 'Posts Per Page')}
                        </Label>
                        <Input
                            id="posts_per_page"
                            type="number"
                            min="1"
                            max="100"
                            value={data.posts_per_page}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    posts_per_page:
                                        parseInt(e.target.value) || 12,
                                }))
                            }
                        />
                        <InputError message={errors.posts_per_page} />
                    </div>

                    {users.length > 0 && (
                        <div className="grid gap-2">
                            <Label htmlFor="default_author_id">
                                {__('label.default_author', 'Default Author')}
                            </Label>
                            <Select
                                value={data.default_author_id}
                                onValueChange={(val) =>
                                    setData((prev) => ({
                                        ...prev,
                                        default_author_id: val,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={__(
                                            'placeholder.none',
                                            'None',
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={String(user.id)}
                                        >
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.default_author_id} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="seo_title">
                            {__('label.seo_title', 'SEO Title')}
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
                            placeholder="SEO title"
                        />
                        <InputError message={errors.seo_title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="seo_description">
                            {__('label.seo_description', 'SEO Description')}
                        </Label>
                        <Textarea
                            id="seo_description"
                            value={data.seo_description}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    seo_description: e.target.value,
                                }))
                            }
                            placeholder="SEO description"
                            rows={2}
                        />
                        <InputError message={errors.seo_description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="position">
                            {__('label.position', 'Position')}
                        </Label>
                        <Input
                            id="position"
                            type="number"
                            min="0"
                            value={data.position}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    position: parseInt(e.target.value) || 0,
                                }))
                            }
                        />
                        <InputError message={errors.position} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="commentable"
                            checked={data.commentable}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    commentable: e.target.checked,
                                }))
                            }
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="commentable" className="font-normal">
                            {__('label.commentable', 'Allow comments')}
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    is_active: e.target.checked,
                                }))
                            }
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            {__(
                                'label.active_visible',
                                'Active (visible on site)',
                            )}
                        </Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? __('misc.creating', 'Creating...')
                                : __('action.create_blog', 'Create Blog')}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
