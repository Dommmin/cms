import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import InputError from '@/components/input-error';
import MetafieldEditor from '@/components/metafield-editor';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalizedField } from '@/components/ui/localized-field';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { Category, CreateProps } from './create.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: CategoryController.index.url() },
    { title: 'Create Category', href: CategoryController.create.url() },
];

export default function Create({
    categories = [],
    metafield_definitions,
    metafields: initialMetafields,
}: CreateProps) {
    const { locales } = usePage().props as { locales: SharedLocale[] };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';

    const normalizedCategories: Category[] = Array.isArray(categories)
        ? categories
        : (Object.values(categories) as Category[]);

    const __ = useTranslation();
    const [nameValues, setNameValues] = useState<Record<string, string>>({});
    const [descValues, setDescValues] = useState<Record<string, string>>({});
    const [slug, setSlug] = useState('');
    const [isSlugManual, setIsSlugManual] = useState(false);
    const [metafields, setMetafields] = useState(initialMetafields ?? []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleNameChange = (newNames: Record<string, string>) => {
        setNameValues(newNames);
        if (!isSlugManual) {
            setSlug(slugify(newNames[defaultLocale] ?? ''));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const form = e.currentTarget;
        const parentId =
            (form.elements.namedItem('parent_id') as HTMLSelectElement)
                ?.value || null;
        const isActive = (
            form.elements.namedItem('is_active') as HTMLInputElement
        )?.checked;

        router.post(
            CategoryController.store.url(),
            {
                name: nameValues,
                description: descValues,
                slug,
                parent_id: parentId,
                is_active: isActive,
                metafields: metafields as unknown as Record<
                    string,
                    string | number | boolean | null | undefined
                >[],
            },
            {
                onSuccess: () => router.visit(CategoryController.index.url()),
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <Wrapper>
                <PageHeader
                    title={__('page.create_page', 'Create Category')}
                    description={__(
                        'page.create_page_desc',
                        'Create a new category',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={CategoryController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form
                    id="category-create-form"
                    onSubmit={handleSubmit}
                    className="max-w-xl space-y-6"
                >
                    {/* Name */}
                    <LocalizedField
                        label={__('label.name', 'Name')}
                        name="name"
                        value={nameValues}
                        onChange={handleNameChange}
                        required
                        placeholder="Category name"
                        autoFocus
                    />

                    {/* Slug */}
                    <div className="grid gap-2">
                        <Label htmlFor="slug">{__('label.slug', 'Slug')}</Label>
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
                            {__('misc.slug_auto_hint', 'Set slug manually')}
                        </label>
                    </div>

                    {/* Parent Category */}
                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">
                            {__('label.category', 'Parent Category')}
                        </Label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            defaultValue=""
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">None (Top level)</option>
                            {normalizedCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.parent_id} />
                    </div>

                    {/* Description */}
                    <LocalizedField
                        label={__('label.description', 'Description')}
                        type="textarea"
                        name="description"
                        value={descValues}
                        onChange={setDescValues}
                        placeholder="Category description (optional)"
                        rows={3}
                    />

                    {/* Active */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4 space-y-1">
                            <h3 className="text-base font-semibold">
                                Metafields
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Advanced extension layer. Do not use for core
                                category membership or SEO fields.
                            </p>
                        </div>
                        <MetafieldEditor
                            metafields={metafields}
                            definitions={metafield_definitions}
                            onChange={setMetafields}
                            allowCustomFields={false}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            defaultChecked
                            className="h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            {__('label.is_active', 'Active')}
                        </Label>
                    </div>

                    <StickyFormActions
                        formId="category-create-form"
                        processing={processing}
                        submitLabel="Create Category"
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
