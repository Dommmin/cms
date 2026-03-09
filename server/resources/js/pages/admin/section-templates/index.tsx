import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type SectionTemplate = {
    id: number;
    name: string;
    section_type: string;
    variant: string | null;
    category: string | null;
    is_global: boolean;
    thumbnail: string | null;
    created_at: string;
};

type TemplatesData = {
    data: SectionTemplate[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    templates: TemplatesData;
    categories: string[];
    filters: { search?: string; category?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Section Templates', href: '/admin/section-templates' },
];

export default function SectionTemplatesIndex({ templates, filters }: Props) {
    const columns: ColumnDef<SectionTemplate>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-muted-foreground text-xs">
                        {row.original.section_type}
                        {row.original.variant ? ` · ${row.original.variant}` : ''}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) =>
                row.original.category ? (
                    <Badge variant="outline">{row.original.category}</Badge>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                ),
        },
        {
            accessorKey: 'is_global',
            header: 'Scope',
            cell: ({ row }) => (
                <Badge variant={row.original.is_global ? 'default' : 'secondary'}>
                    {row.original.is_global ? 'Global' : 'Local'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            router.post(
                                `/admin/section-templates/${row.original.id}/duplicate`,
                                {},
                                { onSuccess: () => toast.success('Template duplicated') },
                            )
                        }
                    >
                        <Copy className="mr-1 h-3 w-3" />
                        Duplicate
                    </Button>
                    <Link href={`/admin/section-templates/${row.original.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Button>
                    </Link>
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete Template"
                        description="Are you sure you want to delete this template? This cannot be undone."
                        onConfirm={() =>
                            router.delete(
                                `/admin/section-templates/${row.original.id}`,
                                { onSuccess: () => toast.success('Template deleted') },
                            )
                        }
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        Delete
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
                    title="Section Templates"
                    description="Reusable section presets for the page builder"
                >
                    <PageHeaderActions>
                        <Link href="/admin/section-templates/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Template
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
                    searchPlaceholder="Search templates..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/section-templates"
                />
            </Wrapper>
        </AppLayout>
    );
}
