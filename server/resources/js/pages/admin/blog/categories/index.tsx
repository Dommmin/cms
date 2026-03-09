import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';

type BlogCategory = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    description: string | Record<string, string> | null;
    is_active: boolean;
    position: number;
    posts_count: number;
    parent: { id: number; name: string | Record<string, string> } | null;
};

type CategoriesData = {
    data: BlogCategory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    categories: CategoriesData;
    filters: { search?: string; is_active?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Categories', href: '/admin/blog/categories' },
];

export default function BlogCategoriesIndex({ categories, filters }: Props) {
    const columns: ColumnDef<BlogCategory>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{resolveLocalizedText(row.original.name)}</p>
                    <p className="text-xs text-muted-foreground">{row.original.slug}</p>
                    {row.original.parent && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            {resolveLocalizedText(row.original.parent.name)}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            accessorKey: 'posts_count',
            header: 'Posts',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.posts_count}</span>
            ),
        },
        {
            accessorKey: 'position',
            header: 'Position',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.position}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link href={`/admin/blog/categories/${row.original.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Button>
                    </Link>
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete Category"
                        description="Are you sure you want to delete this category? Posts will not be deleted."
                        onConfirm={() => {
                            router.delete(`/admin/blog/categories/${row.original.id}`, {
                                onSuccess: () => toast.success('Category deleted'),
                            });
                        }}
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
            <Head title="Blog Categories" />
            <Wrapper>
                <PageHeader
                    title="Blog Categories"
                    description="Organize blog posts into categories"
                >
                    <PageHeaderActions>
                        <Link href="/admin/blog/categories/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Category
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={categories.data}
                    pagination={{
                        current_page: categories.current_page,
                        last_page: categories.last_page,
                        per_page: categories.per_page,
                        total: categories.total,
                        prev_page_url: categories.prev_page_url ?? null,
                        next_page_url: categories.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search categories..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/blog/categories"
                />
            </Wrapper>
        </AppLayout>
    );
}
