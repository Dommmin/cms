import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as SearchSynonymController from '@/actions/App/Http/Controllers/Admin/SearchSynonymController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Search Synonyms',
        href: SearchSynonymController.index.url(),
    },
    { title: 'Add Synonym', href: '' },
];

export default function CreateSynonym() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Search Synonym" />
            <Wrapper>
                <PageHeader
                    title="Add Synonym"
                    description="Create a new synonym group to expand search coverage."
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <Link href={SearchSynonymController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={SearchSynonymController.store.url()}
                    method="post"
                    className="max-w-lg space-y-6 rounded-xl border bg-card p-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="term">Main Term *</Label>
                                <Input
                                    id="term"
                                    name="term"
                                    placeholder="e.g. t-shirt"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.term} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="synonyms_text">
                                    Synonyms *
                                </Label>
                                <Textarea
                                    id="synonyms_text"
                                    name="synonyms_text"
                                    rows={4}
                                    placeholder={
                                        'One synonym per line:\ntee\nshirt\ntop'
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter one synonym per line.
                                </p>
                                <InputError message={errors.synonyms} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="hidden"
                                    name="is_active"
                                    value="0"
                                />
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Active
                                </Label>
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Synonym'}
                            </Button>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
