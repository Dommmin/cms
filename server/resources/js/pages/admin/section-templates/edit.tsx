import { Link, Form, Head, router } from '@inertiajs/react';
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

type SectionTemplate = {
    id: number;
    name: string;
    section_type: string;
    variant: string | null;
    category: string | null;
    preset_data: Record<string, unknown>;
    thumbnail: string | null;
    is_global: boolean;
};

type Props = {
    template: SectionTemplate;
    categories: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Section Templates', href: '/admin/section-templates' },
    { title: 'Edit', href: '#' },
];

export default function EditSectionTemplate({ template, categories }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Template: ${template.name}`} />
            <Wrapper>
                <PageHeader
                    title={`Edit: ${template.name}`}
                    description="Modify this section template"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                <Link href='/admin/section-templates' prefetch cacheFor={30}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back
                        
                </Link>
            </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={`/admin/section-templates/${template.id}`}
                    method="put"
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
                                    defaultValue={template.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="section_type">Section Type *</Label>
                                <Input
                                    id="section_type"
                                    name="section_type"
                                    required
                                    defaultValue={template.section_type}
                                />
                                <InputError message={errors.section_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="variant">Variant</Label>
                                <Select
                                    name="variant"
                                    defaultValue={template.variant ?? undefined}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['light', 'dark', 'muted', 'brand', 'hero'].map((v) => (
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
                                    defaultValue={template.category ?? ''}
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
                                <Label htmlFor="preset_data">Preset Data (JSON) *</Label>
                                <Textarea
                                    id="preset_data"
                                    name="preset_data"
                                    required
                                    rows={12}
                                    defaultValue={JSON.stringify(template.preset_data, null, 2)}
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
                                    defaultChecked={template.is_global}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="is_global" className="font-normal">
                                    Global (available in all pages)
                                </Label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
