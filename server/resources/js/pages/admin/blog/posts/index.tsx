import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    EyeOffIcon,
    GlobeIcon,
    PencilIcon,
    PlusIcon,
    StarIcon,
    TrashIcon,
} from 'lucide-react';
import * as BlogPostController from '@/actions/App/Http/Controllers/Admin/BlogPostController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import ListFilters from '@/components/list-filters';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import type { BlogPost, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Posts', href: BlogPostController.index.url() },
];

const STATUS_BADGE: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    published: 'default',
    draft: 'secondary',
    archived: 'destructive',
};

export default function BlogPostsIndex({
    posts,
    filters,
    statuses,
    categories,
}: IndexProps) {
    const __ = useTranslation();
    const activeFilterCount = [
        filters.category_id,
        filters.status,
        filters.content_type,
    ].filter(Boolean).length;

    const updateFilters = (
        nextFilters: Partial<
            Pick<
                IndexProps['filters'],
                'category_id' | 'status' | 'content_type'
            >
        >,
    ) => {
        router.get(
            BlogPostController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const columns: ColumnDef<BlogPost>[] = [
        {
            accessorKey: 'title',
            header: __('column.title', 'Title'),
            cell: ({ row }) => (
                <div className="max-w-sm">
                    <div className="flex items-center gap-1">
                        {row.original.is_featured && (
                            <StarIcon className="h-3 w-3 shrink-0 text-yellow-500" />
                        )}
                        <p className="line-clamp-1 font-medium">
                            {resolveLocalizedText(row.original.title)}
                        </p>
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
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={STATUS_BADGE[row.original.status] ?? 'secondary'}
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'content_type',
            header: __('column.type', 'Type'),
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.content_type}
                </Badge>
            ),
        },
        {
            accessorKey: 'author',
            header: __('column.author', 'Author'),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.author?.name ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'published_at',
            header: __('column.published_at', 'Published'),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.published_at
                        ? new Date(
                              row.original.published_at,
                          ).toLocaleDateString()
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
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={BlogPostController.edit.url(row.original.id)}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    {row.original.status !== 'published' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    BlogPostController.publish.url(
                                        row.original.id,
                                    ),
                                    {},
                                );
                            }}
                        >
                            <GlobeIcon className="mr-1 h-3 w-3" />
                            {__('action.publish', 'Publish')}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    BlogPostController.unpublish.url(
                                        row.original.id,
                                    ),
                                    {},
                                );
                            }}
                        >
                            <EyeOffIcon className="mr-1 h-3 w-3" />
                            {__('action.unpublish', 'Unpublish')}
                        </Button>
                    )}
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Post')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(
                                BlogPostController.destroy.url(row.original.id),
                            );
                        }}
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
            <Head title="Blog Posts" />
            <Wrapper>
                <PageHeader
                    title={__('page.blog_posts', 'Blog Posts')}
                    description={__(
                        'page.blog_posts_desc',
                        'Manage your blog content',
                    )}
                >
                    <PageHeaderActions compact>
                        <Link href={BlogPostController.create.url()}>
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('page.create_post', 'New Post')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.blog_posts_filters_desc',
                        'Filter posts by category, status, and content type.',
                    )}
                    contentClassName="sm:grid sm:grid-cols-3 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="blog-category-filter">
                            {__('column.category', 'Category')}
                        </Label>
                        <Select
                            value={filters.category_id || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    category_id: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="blog-category-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__(
                                        'column.category',
                                        'Category',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="blog-status-filter">
                            {__('column.status', 'Status')}
                        </Label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    status: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="blog-status-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.status', 'Status')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="blog-type-filter">
                            {__('column.type', 'Type')}
                        </Label>
                        <Select
                            value={filters.content_type || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    content_type: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="blog-type-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.type', 'Type')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                <SelectItem value="article">Article</SelectItem>
                                <SelectItem value="page">Page</SelectItem>
                                <SelectItem value="news">News</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </ListFilters>

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
                    searchPlaceholder={__(
                        'placeholder.search_posts',
                        'Search posts...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={BlogPostController.index.url()}
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => resolveLocalizedText(row.title)}
                />
            </Wrapper>
        </AppLayout>
    );
}
