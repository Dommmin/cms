import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    BookOpen,
    PencilIcon,
    PlusIcon,
    StarIcon,
    TrashIcon,
} from 'lucide-react';
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

type Category = { id: number; name: string | Record<string, string> };

type BlogPost = {
    id: number;
    title: string | Record<string, string>;
    slug: string;
    status: string;
    content_type: string;
    is_featured: boolean;
    views_count: number;
    published_at: string | null;
    created_at: string;
    category: Category | null;
    author: { id: number; name: string } | null;
};

type PostsData = {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type StatusOption = { value: string; label: string };

type Props = {
    posts: PostsData;
    filters: {
        search?: string;
        category_id?: string;
        status?: string;
        content_type?: string;
    };
    statuses: StatusOption[];
    categories: { id: number; name: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Posts', href: '/admin/blog/posts' },
];

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    published: 'default',
    draft: 'secondary',
    archived: 'destructive',
};

export default function BlogPostsIndex({ posts, filters, statuses, categories }: Props) {
    const columns: ColumnDef<BlogPost>[] = [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => (
                <div className="max-w-sm">
                    <div className="flex items-center gap-1">
                        {row.original.is_featured && (
                            <StarIcon className="h-3 w-3 text-yellow-500 shrink-0" />
                        )}
                        <p className="line-clamp-1 font-medium">{resolveLocalizedText(row.original.title)}</p>
                    </div>
                    {row.original.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            {resolveLocalizedText(row.original.category.name)}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={STATUS_BADGE[row.original.status] ?? 'secondary'}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'content_type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.content_type}
                </Badge>
            ),
        },
        {
            accessorKey: 'author',
            header: 'Author',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.author?.name ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'published_at',
            header: 'Published',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.published_at
                        ? new Date(row.original.published_at).toLocaleDateString()
                        : '—'}
                </span>
            ),
        },
        {
            accessorKey: 'views_count',
            header: 'Views',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.views_count}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link href={`/admin/blog/posts/${row.original.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Button>
                    </Link>
                    {row.original.status !== 'published' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    `/admin/blog/posts/${row.original.id}/publish`,
                                    {},
                                    { onSuccess: () => toast.success('Post published') },
                                );
                            }}
                        >
                            Publish
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    `/admin/blog/posts/${row.original.id}/unpublish`,
                                    {},
                                    { onSuccess: () => toast.success('Post unpublished') },
                                );
                            }}
                        >
                            Unpublish
                        </Button>
                    )}
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete Post"
                        description="Are you sure you want to delete this post? This action cannot be undone."
                        onConfirm={() => {
                            router.delete(`/admin/blog/posts/${row.original.id}`, {
                                onSuccess: () => toast.success('Post deleted'),
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
            <Head title="Blog Posts" />
            <Wrapper>
                <PageHeader
                    title="Blog Posts"
                    description="Manage your blog content"
                >
                    <PageHeaderActions>
                        <Link href="/admin/blog/posts/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Post
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={posts.data}
                    pagination={{
                        current_page: posts.current_page,
                        last_page: posts.last_page,
                        per_page: posts.per_page,
                        total: posts.total,
                        prev_page_url: posts.prev_page_url ?? null,
                        next_page_url: posts.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search posts..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/blog/posts"
                />
            </Wrapper>
        </AppLayout>
    );
}
