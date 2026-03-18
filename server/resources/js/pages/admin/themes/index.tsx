import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CopyIcon,
    CheckIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Theme = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    pages_count: number;
    created_at: string;
};

type ThemesData = {
    data: Theme[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    themes: ThemesData;
    filters: { search?: string; is_active?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Themes', href: '/admin/themes' },
];

export default function ThemesIndex({ themes, filters }: Props) {
    const { props } = usePage<{
        activeTheme?: { id: number; slug: string } | null;
    }>();
    const activeTheme = props.activeTheme;

    const columns: ColumnDef<Theme>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.slug}</span>
            ),
        },
        {
            accessorKey: 'pages_count',
            header: 'Pages',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.pages_count}</span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge variant="default">
                        <CheckIcon className="mr-1 h-3 w-3" />
                        Active
                    </Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.is_active ? (
                        <Button variant="outline" size="sm" disabled>
                            Active
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    `/admin/themes/${row.original.id}/activate`,
                                    {},
                                    {
                                        onSuccess: () =>
                                            toast.success('Theme activated'),
                                    },
                                );
                            }}
                        >
                            Activate
                        </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/themes/${row.original.id}/edit`} prefetch cacheFor={30}>
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            router.post(
                                `/admin/themes/${row.original.id}/duplicate`,
                                {},
                                {
                                    onSuccess: () =>
                                        toast.success('Theme duplicated'),
                                },
                            );
                        }}
                    >
                        <CopyIcon className="mr-1 h-3 w-3" />
                        Duplicate
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Theme"
                        description={`Are you sure you want to delete "${row.original.name}"?`}
                        onConfirm={() => {
                            router.delete(`/admin/themes/${row.original.id}`, {
                                onSuccess: () => toast.success('Theme deleted'),
                            });
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
                <PageHeader title="Themes" description="Manage site themes">
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() => {
                                router.post(
                                    '/admin/themes/disable',
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
                            Disable Theme
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin/themes/create" prefetch cacheFor={30}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Theme
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
                    searchPlaceholder="Search themes..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/themes"
                />
            </Wrapper>
        </AppLayout>
    );
}
