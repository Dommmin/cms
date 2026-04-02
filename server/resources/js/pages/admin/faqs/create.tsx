import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as FaqController from '@/actions/App/Http/Controllers/Admin/FaqController';
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
import type { CreateProps } from './create.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'FAQ', href: FaqController.index.url() },
    { title: 'Create', href: FaqController.create.url() },
];

export default function Create({ categories }: CreateProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create FAQ" />
            <Wrapper>
                <PageHeader
                    title="Create FAQ"
                    description="Add a new frequently asked question"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={FaqController.index.url()}
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
                    action={FaqController.store.url()}
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="question">Question *</Label>
                                <Input
                                    id="question"
                                    name="question"
                                    required
                                    placeholder="Enter the question"
                                />
                                <InputError message={errors.question} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="answer">Answer *</Label>
                                <Textarea
                                    id="answer"
                                    name="answer"
                                    required
                                    placeholder="Enter the answer"
                                    rows={5}
                                />
                                <InputError message={errors.answer} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select name="category">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="__new__">
                                            + New category
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category} />
                            </div>

                            <div
                                className="grid gap-2"
                                id="new-category-wrapper"
                                hidden
                            >
                                <Label htmlFor="new_category">
                                    New Category
                                </Label>
                                <Input
                                    id="new_category"
                                    name="new_category"
                                    placeholder="Enter new category name"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    name="position"
                                    type="number"
                                    min="0"
                                    defaultValue="0"
                                />
                                <InputError message={errors.position} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Active (visible on site)
                                </Label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Creating...' : 'Create FAQ'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
