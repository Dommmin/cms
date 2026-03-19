import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

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
import type { BreadcrumbItem } from '@/types';

type Props = {
    categories: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Section Templates', href: '/admin/section-templates' },
    { title: 'Create', href: '/admin/section-templates/create' },
];

export default function CreateSectionTemplate({ categories }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Section Template" />
            <Wrapper>
                <PageHeader
                    title="Create Section Template"
                    description="Add a new reusable section template"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/section-templates"
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action="/admin/section-templates"
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Template name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="section_type">
                                    Section Type *
                                </Label>
                                <Input
                                    id="section_type"
                                    name="section_type"
                                    required
                                    placeholder="e.g. hero, contained, two-col"
                                />
                                <InputError message={errors.section_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="variant">Variant</Label>
                                <Select name="variant">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            'light',
                                            'dark',
                                            'muted',
                                            'brand',
                                            'hero',
                                        ].map((v) => (
                                            <SelectItem key={v} value={v}>
                                                {v}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.variant} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    placeholder="e.g. Marketing, Content, E-commerce"
                                    list="category-list"
                                />
                                <datalist id="category-list">
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                                <InputError message={errors.category} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="preset_data">
                                    Preset Data (JSON) *
                                </Label>
                                <Textarea
                                    id="preset_data"
                                    name="preset_data"
                                    required
                                    rows={10}
                                    placeholder='{"blocks": []}'
                                    className="font-mono text-xs"
                                />
                                <InputError message={errors.preset_data} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_global"
                                    name="is_global"
                                    value="1"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_global"
                                    className="font-normal"
                                >
                                    Global (available in all pages)
                                </Label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Template'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
