import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CheckIcon,
    CopyIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as ThemeController from '@/actions/App/Http/Controllers/Admin/ThemeController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, Theme } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Themes', href: ThemeController.index.url() },
];

export default function ThemesIndex({ themes, filters }: IndexProps) {
    const { props } = usePage<{
        activeTheme?: { id: number; slug: string } | null;
    }>();
    const activeTheme = props.activeTheme;
    const __ = useTranslation();

    const columns: ColumnDef<Theme>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'slug',
            header: __('column.slug', 'Slug'),
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.slug}</span>
            ),
        },
        {
            accessorKey: 'pages_count',
            header: __('column.pages', 'Pages'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.pages_count}</span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge variant="default">
                        <CheckIcon className="mr-1 h-3 w-3" />
                        {__('status.active', 'Active')}
                    </Badge>
                ) : (
                    <Badge variant="secondary">
                        {__('status.inactive', 'Inactive')}
                    </Badge>
                ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.is_active ? (
                        <Button variant="outline" size="sm" disabled>
                            {__('status.active', 'Active')}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    ThemeController.activate.url(
                                        row.original.id,
                                    ),
                                    {},
                                    {
                                        onSuccess: () =>
                                            toast.success('Theme activated'),
                                    },
                                );
                            }}
                        >
                            {__('action.activate', 'Activate')}
                        </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={ThemeController.edit.url(row.original.id)}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            router.post(
                                ThemeController.duplicate.url(row.original.id),
                                {},
                                {
                                    onSuccess: () =>
                                        toast.success('Theme duplicated'),
                                },
                            );
                        }}
                    >
                        <CopyIcon className="mr-1 h-3 w-3" />
                        {__('action.duplicate', 'Duplicate')}
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Theme')}
                        description={`Are you sure you want to delete "${row.original.name}"?`}
                        onConfirm={() => {
                            router.delete(
                                ThemeController.destroy.url(row.original.id),
                                {
                                    onSuccess: () =>
                                        toast.success('Theme deleted'),
                                },
                            );
                        }}
                        disabled={row.original.pages_count > 0}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Themes" />
            <Wrapper>
                <PageHeader
                    title={__('page.themes', 'Themes')}
                    description={__('page.themes_desc', 'Manage site themes')}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() => {
                                router.post(
                                    ThemeController.disable.url(),
                                    {},
                                    {
                                        onSuccess: () =>
                                            toast.success(
                                                'Custom theme disabled',
                                            ),
                                    },
                                );
                            }}
                            disabled={!activeTheme}
                        >
                            {__('action.disable', 'Disable Theme')}
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href={ThemeController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'Create Theme')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={themes.data}
                    pagination={{
                        current_page: themes.current_page,
                        last_page: themes.last_page,
                        per_page: themes.per_page,
                        total: themes.total,
                        prev_page_url: themes.prev_page_url ?? null,
                        next_page_url: themes.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search themes...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={ThemeController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
