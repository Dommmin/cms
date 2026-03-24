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
import type { Category, BlogCategory, EditProps } from './edit.types';

export default function EditBlogCategory({
    category,
    parentCategories,
}: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Blog Categories', href: '/admin/blog/categories' },
        {
            title: category.name,
            href: `/admin/blog/categories/${category.id}/edit`,
        },
    ];

    const __ = useTranslation();
    const [data, setData] = useState({
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        parent_id: category.parent_id ? String(category.parent_id) : '',
        is_active: category.is_active,
        position: category.position,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [autoSlug, setAutoSlug] = useState(false);

    const handleNameChange = (name: string) => {
        setData((prev) => ({
            ...prev,
            name,
            slug: autoSlug ? slugify(name) : prev.slug,
        }));
    };

    const handleSlugChange = (slug: string) => {
        setAutoSlug(slug === slugify(data.name));
        setData((prev) => ({ ...prev, slug }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(
            `/admin/blog/categories/${category.id}`,
            {
                ...data,
                parent_id: data.parent_id || null,
            },
            {
                onSuccess: () =>
                    toast.success(
                        __(
                            'misc.category_updated',
                            'Category updated successfully',
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
            <Head title={`Edit: ${category.name}`} />
            <Wrapper>
                <PageHeader
                    title={__('page.edit_blog_category', 'Edit Blog Category')}
                    description={category.name}
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
                            placeholder="category-slug"
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
                                    {parentCategories
                                        .filter((cat) => cat.id !== category.id)
                                        .map((cat) => (
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
                                ? __('misc.saving', 'Saving...')
                                : __('action.save_changes', 'Save Changes')}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
