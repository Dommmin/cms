import { useAdminLocale } from '@/hooks/use-admin-locale';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { VersionHistory } from '@/components/version-history';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';

type Category = { id: number; name: string; slug: string };

type CategoryEditProps = {
    id: number;
    name: Record<string, string>;
    slug: string;
    description?: Record<string, string>;
    parent_id?: number | null;
    is_active: boolean;
};

export default function Edit({
    category,
    categories = [],
}: {
    category: CategoryEditProps;
    categories?: Category[];
}) {
    const { locales } = usePage().props as { locales: SharedLocale[] };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';

    const normalizedCategories: Category[] = Array.isArray(categories)
        ? categories
        : (Object.values(categories) as Category[]);

    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);
    const [nameValues, setNameValues] = useState<Record<string, string>>(
        category.name ?? { [defaultLocale]: '' },
    );
    const [descValues, setDescValues] = useState<Record<string, string>>(
        category.description ?? { [defaultLocale]: '' },
    );
    const [slug, setSlug] = useState(category.slug);
    const [isSlugManual, setIsSlugManual] = useState(
        category.slug !== slugify(category.name?.[defaultLocale] ?? ''),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const parentCategories = normalizedCategories.filter(
        (cat) => cat.id !== category.id,
    );

    const handleNameChange = (locale: string, value: string) => {
        const updated = { ...nameValues, [locale]: value };
        setNameValues(updated);
        if (!isSlugManual && locale === defaultLocale) {
            setSlug(slugify(value));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const form = e.currentTarget;
        const parentId = (form.elements.namedItem('parent_id') as HTMLSelectElement)?.value || null;
        const isActive = (form.elements.namedItem('is_active') as HTMLInputElement)?.checked;

        router.put(
            `/admin/ecommerce/categories/${category.id}`,
            {
                name: nameValues,
                description: descValues,
                slug,
                parent_id: parentId,
                is_active: isActive,
            },
            {
                onSuccess: () => router.visit('/admin/ecommerce/categories'),
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categories', href: '/admin/ecommerce/categories' },
        {
            title: 'Edit Category',
            href: `/admin/ecommerce/categories/${category.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Category" />

            <Wrapper>
                <PageHeader
                    title="Edit Category"
                    description={`Update details for ${nameValues[defaultLocale] ?? ''}`}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/ecommerce/categories')
                            }
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form
                    id="category-edit-form"
                    onSubmit={handleSubmit}
                    className="max-w-xl space-y-6"
                >
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Name</Label>
                            <LocaleTabSwitcher
                                locales={locales}
                                activeLocale={activeLocale}
                                onLocaleChange={setActiveLocale}
                            />
                        </div>
                        {locales.length > 0 ? (
                            locales.map((locale) => (
                                <div
                                    key={locale.code}
                                    className={
                                        locale.code !== activeLocale
                                            ? 'hidden'
                                            : undefined
                                    }
                                >
                                    <Input
                                        required={locale.code === defaultLocale}
                                        autoFocus={
                                            locale.code === defaultLocale
                                        }
                                        placeholder="Category name"
                                        value={nameValues[locale.code] ?? ''}
                                        onChange={(e) =>
                                            handleNameChange(
                                                locale.code,
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ))
                        ) : (
                            <Input
                                required
                                autoFocus
                                placeholder="Category name"
                                value={nameValues[defaultLocale] ?? ''}
                                onChange={(e) =>
                                    handleNameChange(defaultLocale, e.target.value)
                                }
                            />
                        )}
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={slug}
                            readOnly={!isSlugManual}
                            onChange={(e) => setSlug(slugify(e.target.value))}
                        />
                        <InputError message={errors.slug} />
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={isSlugManual}
                                onChange={(e) => {
                                    const manual = e.target.checked;
                                    setIsSlugManual(manual);
                                    if (!manual) {
                                        setSlug(
                                            slugify(
                                                nameValues[defaultLocale] ?? '',
                                            ),
                                        );
                                    }
                                }}
                                className="h-4 w-4 rounded border-input"
                            />
                            Ustaw slug ręcznie
                        </label>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">Parent Category</Label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            defaultValue={category.parent_id ?? ''}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">None (Top level)</option>
                            {parentCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.parent_id} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Description</Label>
                            <LocaleTabSwitcher
                                locales={locales}
                                activeLocale={activeLocale}
                                onLocaleChange={setActiveLocale}
                            />
                        </div>
                        {locales.length > 0 ? (
                            locales.map((locale) => (
                                <div
                                    key={locale.code}
                                    className={
                                        locale.code !== activeLocale
                                            ? 'hidden'
                                            : undefined
                                    }
                                >
                                    <textarea
                                        rows={3}
                                        placeholder="Category description (optional)"
                                        value={descValues[locale.code] ?? ''}
                                        onChange={(e) =>
                                            setDescValues((prev) => ({
                                                ...prev,
                                                [locale.code]: e.target.value,
                                            }))
                                        }
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            ))
                        ) : (
                            <textarea
                                rows={3}
                                placeholder="Category description (optional)"
                                value={descValues[defaultLocale] ?? ''}
                                onChange={(e) =>
                                    setDescValues((prev) => ({
                                        ...prev,
                                        [defaultLocale]: e.target.value,
                                    }))
                                }
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        )}
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            defaultChecked={category.is_active}
                            className="h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Active
                        </Label>
                    </div>

                    <StickyFormActions
                        formId="category-edit-form"
                        processing={processing}
                        submitLabel="Save Changes"
                    />

                    <VersionHistory modelType="category" modelId={category.id} />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
