import { Head, router } from '@inertiajs/react';
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
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';

type Category = { id: number; name: string };

type Props = {
    parentCategories: Category[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Categories', href: '/admin/blog/categories' },
    { title: 'Create', href: '/admin/blog/categories/create' },
];

export default function CreateBlogCategory({ parentCategories }: Props) {
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
                onSuccess: () => toast.success('Category created successfully'),
                onError: (errs) => {
                    setErrors(errs);
                    toast.error('Please fix the errors below');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Blog Category" />
            <Wrapper>
                <PageHeader
                    title="Create Blog Category"
                    description="Add a new category to organize your blog posts"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/admin/blog/categories')}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
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
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="category-slug (auto-generated)"
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Brief description of the category"
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    {parentCategories.length > 0 && (
                        <div className="grid gap-2">
                            <Label htmlFor="parent_id">Parent Category</Label>
                            <Select
                                value={data.parent_id}
                                onValueChange={(val) =>
                                    setData((prev) => ({ ...prev, parent_id: val }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="None (root category)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {parentCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.parent_id} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="position">Position</Label>
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
                                setData((prev) => ({ ...prev, is_active: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Active (visible on site)
                        </Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
