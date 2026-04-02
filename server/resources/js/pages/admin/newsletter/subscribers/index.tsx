import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as NewsletterSubscriberController from '@/actions/App/Http/Controllers/Admin/NewsletterSubscriberController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, Subscriber } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: NewsletterSubscriberController.index.url() },
    { title: 'Subscribers', href: NewsletterSubscriberController.index.url() },
];

export default function SubscribersIndex({ subscribers, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Subscriber>[] = [
        {
            accessorKey: 'email',
            header: __('label.email', 'Email'),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.email}</div>
            ),
        },
        {
            accessorKey: 'first_name',
            header: __('column.name', 'Name'),
            cell: ({ row }) =>
                row.original.first_name ? (
                    <span>{row.original.first_name}</span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'tags',
            header: __('column.tags', 'Tags'),
            cell: ({ row }) =>
                row.original.tags && row.original.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {row.original.tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active
                        ? __('status.active', 'Active')
                        : __('status.inactive', 'Inactive')}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: __('column.created_at', 'Subscribed'),
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={NewsletterSubscriberController.show.url(
                                row.original.id,
                            )}
                            prefetch
                            cacheFor={60}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            {__('action.show', 'View')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={NewsletterSubscriberController.edit.url(
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
                        title={__('dialog.delete_title', 'Delete Subscriber')}
                        description={`Are you sure you want to delete "${row.original.email}"?`}
                        onConfirm={() => {
                            router.delete(
                                NewsletterSubscriberController.destroy.url(
                                    row.original.id,
                                ),
                                {
                                    onSuccess: () =>
                                        toast.success('Subscriber deleted'),
                                },
                            );
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Newsletter Subscribers" />
            <Wrapper>
                <PageHeader
                    title={__('page.subscribers', 'Subscribers')}
                    description={__(
                        'page.subscribers_desc',
                        'Manage newsletter subscribers',
                    )}
                >
                    <PageHeaderActions>
                        <Link
                            href={NewsletterSubscriberController.create.url()}
                        >
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Subscriber')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={subscribers.data}
                    pagination={{
                        current_page: subscribers.current_page,
                        last_page: subscribers.last_page,
                        per_page: subscribers.per_page,
                        total: subscribers.total,
                        prev_page_url: subscribers.prev_page_url ?? null,
                        next_page_url: subscribers.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search subscribers...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={NewsletterSubscriberController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
