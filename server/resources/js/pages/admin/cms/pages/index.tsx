import { Link, Head, router, usePage, useForm } from '@inertiajs/react';
import { FileTextIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { usePageColumns } from '@/components/columns/page-columns';

import DataTable from '@/components/data-table';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { PagesData } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pages',
        href: '/admin/cms/pages',
    },
];

function CloneSiteDialog({ locales }: { locales: SharedLocale[] }) {
    const __ = useTranslation();
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        source_locale: 'global',
        target_locale: '',
    });

    const sourceOptions = [
        { value: 'global', label: 'Global (no locale)' },
        ...locales.map((l) => ({
            value: l.code,
            label: `${l.name} (${l.code})`,
        })),
    ];
    const targetOptions = locales.filter((l) => l.code !== data.source_locale);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/cms/pages/clone-site', {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <CopyIcon className="mr-2 h-4 w-4" />
                    {__('action.clone_site', 'Clone Site')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {__('dialog.clone_site', 'Clone Site')}
                    </DialogTitle>
                    <DialogDescription>
                        {__(
                            'dialog.clone_site_desc',
                            'Copy all pages from one locale to another. The target locale must be empty.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>
                            {__('label.source_locale', 'Source locale')}
                        </Label>
                        <Select
                            value={data.source_locale}
                            onValueChange={(v) => setData('source_locale', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError
                            message={
                                (errors as Record<string, string>).source_locale
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>
                            {__('label.target_locale', 'Target locale')}
                        </Label>
                        <Select
                            value={data.target_locale}
                            onValueChange={(v) => setData('target_locale', v)}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={__(
                                        'placeholder.select_locale',
                                        'Select locale',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {targetOptions.map((l) => (
                                    <SelectItem key={l.code} value={l.code}>
                                        {l.name} ({l.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError
                            message={
                                (errors as Record<string, string>).target_locale
                            }
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            {__('action.cancel', 'Cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.target_locale}
                        >
                            {processing
                                ? __('misc.cloning', 'Cloning...')
                                : __('action.clone', 'Clone')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({
    pages,
    filters,
}: {
    pages: PagesData;
    filters: { search?: string; locale?: string };
}) {
    const __ = useTranslation();
    const pageColumns = usePageColumns();
    const { locales } = usePage().props as { locales: SharedLocale[] };

    const activeLocale = filters.locale ?? 'all';

    function setLocaleFilter(locale: string) {
        const params: Record<string, string> = {};
        if (filters.search) params.search = filters.search;
        if (locale !== 'all') params.locale = locale;
        router.get('/admin/cms/pages', params, { preserveState: false });
    }

    const localeTabs = [
        { value: 'all', label: __('filter.all', 'All') },
        { value: 'global', label: __('filter.global', 'Global') },
        ...locales.map((l) => ({
            value: l.code,
            label: `${l.name} (${l.code})`,
        })),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages" />

            <Wrapper>
                <PageHeader
                    title={__('page.pages', 'Pages')}
                    description={__(
                        'page.pages_desc',
                        'Manage CMS pages and content',
                    )}
                >
                    <PageHeaderActions>
                        {locales.length > 0 && (
                            <CloneSiteDialog locales={locales} />
                        )}
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/cms/pages/create"
                                prefetch
                                cacheFor={30}
                            >
                                <FileTextIcon className="mr-2 h-4 w-4" />
                                {__('page.create_page', 'Create Page')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                {/* Locale filter tabs */}
                <div className="mb-4 flex flex-wrap gap-1 border-b pb-2">
                    {localeTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setLocaleFilter(tab.value)}
                            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                activeLocale === tab.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <DataTable
                    columns={pageColumns}
                    data={pages.data}
                    pagination={{
                        current_page: pages.current_page,
                        last_page: pages.last_page,
                        per_page: pages.per_page,
                        total: pages.total,
                        prev_page_url: pages.prev_page_url ?? null,
                        next_page_url: pages.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_pages',
                        'Search by title or slug...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/cms/pages"
                />
            </Wrapper>
        </AppLayout>
    );
}
