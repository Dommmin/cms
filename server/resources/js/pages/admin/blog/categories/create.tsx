import { Link, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
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
    { title: 'Blog Categories', href: '/admin/blog/categories' },
    { title: 'Create', href: '/admin/blog/categories/create' },
];

export default function CreateBlogCategory({ parentCategories }: CreateProps) {
    const __ = useTranslation();
    const [data, setData] = useState({
        name: '',
        slug: '',
        description: '',
        parent_id: '',
        is_active: true,
        position: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [autoSlug, setAutoSlug] = useState(true);

    const handleNameChange = (name: string) => {
        setData((prev) => ({
            ...prev,
            name,
            slug: autoSlug ? slugify(name) : prev.slug,
        }));
    };

    const handleSlugChange = (slug: string) => {
        setAutoSlug(slug === '' || slug === slugify(data.name));
        setData((prev) => ({ ...prev, slug }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            '/admin/blog/categories',
            {
                ...data,
                parent_id: data.parent_id || null,
            },
            {
                onSuccess: () =>
                    toast.success(
                        __(
                            'misc.category_created',
                            'Category created successfully',
                        ),
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
            <Head
                title={__('page.create_blog_category', 'Create Blog Category')}
            />
            <Wrapper>
                <PageHeader
                    title={__(
                        'page.create_blog_category',
                        'Create Blog Category',
                    )}
                    description={__(
                        'page.create_blog_category_desc',
                        'Add a new category to organize your blog posts',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/blog/categories"
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
                        <Label htmlFor="name">
                            {__('label.name', 'Name')} *
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            required
                            autoFocus
                            placeholder="Category name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">{__('label.slug', 'Slug')}</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="category-slug (auto-generated)"
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            {__('label.description', 'Description')}
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Brief description of the category"
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    {parentCategories.length > 0 && (
                        <div className="grid gap-2">
                            <Label htmlFor="parent_id">
                                {__('label.parent_category', 'Parent Category')}
                            </Label>
                            <Select
                                value={data.parent_id}
                                onValueChange={(val) =>
                                    setData((prev) => ({
                                        ...prev,
                                        parent_id: val,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={__(
                                            'placeholder.none_root',
                                            'None (root category)',
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {parentCategories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.parent_id} />
                        </div>
                    )}

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
                                : __(
                                      'action.create_category',
                                      'Create Category',
                                  )}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
