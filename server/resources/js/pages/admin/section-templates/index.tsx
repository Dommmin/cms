import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as SectionTemplateController from '@/actions/App/Http/Controllers/Admin/SectionTemplateController';

import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SectionTemplate, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Section Templates', href: SectionTemplateController.index.url() },
];

export default function SectionTemplatesIndex({
    templates,
    filters,
}: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<SectionTemplate>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.section_type}
                        {row.original.variant
                            ? ` · ${row.original.variant}`
                            : ''}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: __('column.category', 'Category'),
            cell: ({ row }) =>
                row.original.category ? (
                    <Badge variant="outline">{row.original.category}</Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'is_global',
            header: __('column.scope', 'Scope'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_global ? 'default' : 'secondary'}
                >
                    {row.original.is_global
                        ? __('misc.global', 'Global')
                        : __('misc.local', 'Local')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.post(
                                SectionTemplateController.duplicate.url(
                                    row.original.id,
                                ),
                                {},
                                {
                                    onSuccess: () =>
                                        toast.success('Template duplicated'),
                                },
                            )
                        }
                    >
                        <Copy className="mr-1 h-3 w-3" />
                        {__('action.duplicate', 'Duplicate')}
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={SectionTemplateController.edit.url(
                                row.original.id,
                            )}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Template')}
                        description={__(
                            'dialog.cannot_be_undone',
                            'Are you sure you want to delete this template? This cannot be undone.',
                        )}
                        onConfirm={() =>
                            router.delete(
                                SectionTemplateController.destroy.url(
                                    row.original.id,
                                ),
                                {
                                    onSuccess: () =>
                                        toast.success('Template deleted'),
                                },
                            )
                        }
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        {__('action.delete', 'Delete')}
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Section Templates" />
            <Wrapper>
                <PageHeader
                    title={__('page.section_templates', 'Section Templates')}
                    description={__(
                        'page.section_templates_desc',
                        'Reusable section presets for the page builder',
                    )}
                >
                    <PageHeaderActions>
                        <Link href={SectionTemplateController.create.url()}>
                            <Button variant="outline">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'New Template')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={templates.data}
                    pagination={{
                        current_page: templates.current_page,
                        last_page: templates.last_page,
                        per_page: templates.per_page,
                        total: templates.total,
                        prev_page_url: templates.prev_page_url ?? null,
                        next_page_url: templates.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search templates...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={SectionTemplateController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
